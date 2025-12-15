import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2.49.8';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

// Prefix for all routes
const prefix = '/make-server-76deef69';

// Helper function to create Supabase client
const getSupabaseClient = () => createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
);

// Helper function to fetch all items by prefix
const fetchByPrefix = async (keyPrefix: string) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('kv_store_76deef69')
    .select('key, value')
    .like('key', `${keyPrefix}:%`);
  
  if (error) {
    throw error;
  }
  
  return data?.map((item: any) => ({
    id: item.key,
    ...item.value
  })) || [];
};

// Rooms endpoints
app.get(`${prefix}/rooms`, async (c) => {
  try {
    const rooms = await fetchByPrefix('room');
    return c.json({ rooms });
  } catch (error) {
    console.log('Error fetching rooms:', error);
    return c.json({ error: 'Failed to fetch rooms' }, 500);
  }
});

app.post(`${prefix}/rooms`, async (c) => {
  try {
    const room = await c.req.json();
    const roomId = `room:${Date.now()}`;
    // Don't store the id in the value, it's in the key
    const { id, ...roomData } = room as any;
    await kv.set(roomId, roomData);
    return c.json({ success: true, id: roomId });
  } catch (error) {
    console.log('Error creating room:', error);
    return c.json({ error: 'Failed to create room' }, 500);
  }
});

app.put(`${prefix}/rooms/:id`, async (c) => {
  try {
    const id = c.req.param('id');
    const room = await c.req.json();
    // Don't store the id in the value, it's in the key
    const { id: _, ...roomData } = room as any;
    await kv.set(id, roomData);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error updating room:', error);
    return c.json({ error: 'Failed to update room' }, 500);
  }
});

app.delete(`${prefix}/rooms/:id`, async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(id);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting room:', error);
    return c.json({ error: 'Failed to delete room' }, 500);
  }
});

// Bookings endpoints
app.get(`${prefix}/bookings`, async (c) => {
  try {
    const bookings = await fetchByPrefix('booking');
    return c.json({ bookings });
  } catch (error) {
    console.log('Error fetching bookings:', error);
    return c.json({ error: 'Failed to fetch bookings' }, 500);
  }
});

app.get(`${prefix}/bookings/user/:userId`, async (c) => {
  try {
    const userId = c.req.param('userId');
    const bookings = await fetchByPrefix('booking');
    
    const userBookings = bookings.filter((b: any) => b.userId === userId);
    return c.json({ bookings: userBookings });
  } catch (error) {
    console.log('Error fetching user bookings:', error);
    return c.json({ error: 'Failed to fetch user bookings' }, 500);
  }
});

app.post(`${prefix}/bookings`, async (c) => {
  try {
    const booking = await c.req.json();
    const bookingId = `booking:${Date.now()}`;
    
    // Check for conflicts - need to get key-value pairs
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from('kv_store_76deef69')
      .select('key, value')
      .like('key', 'booking:%');
    
    const allBookings = data?.map((item: any) => ({
      id: item.key,
      ...item.value
    })) || [];
    
    // Helper function để generate tất cả dates của semester booking
    const generateSemesterDates = (startDate: string, endDate: string, recurringDays: number[]) => {
      const dates: string[] = [];
      const current = new Date(startDate);
      const end = new Date(endDate);
      
      while (current <= end) {
        const dayOfWeek = current.getDay();
        if (recurringDays.includes(dayOfWeek)) {
          dates.push(current.toISOString().split('T')[0]);
        }
        current.setDate(current.getDate() + 1);
      }
      
      return dates;
    };
    
    // Helper function để check time conflict
    const hasTimeConflict = (booking1: any, booking2: any) => {
      return (
        (booking1.startTime >= booking2.startTime && booking1.startTime < booking2.endTime) ||
        (booking1.endTime > booking2.startTime && booking1.endTime <= booking2.endTime) ||
        (booking1.startTime <= booking2.startTime && booking1.endTime >= booking2.endTime)
      );
    };
    
    // Generate dates để check conflict
    const datesToCheck = booking.isSemester 
      ? generateSemesterDates(booking.date, booking.semesterEndDate, booking.recurringDays)
      : [booking.date];
    
    // Check conflict với existing bookings
    const hasConflict = allBookings.some((existingBooking: any) => {
      if (existingBooking.roomId !== booking.roomId) return false;
      if (existingBooking.status === 'Rejected' || existingBooking.status === 'Cancelled') return false;
      
      // Generate dates của existing booking
      const existingDates = existingBooking.isSemester
        ? generateSemesterDates(existingBooking.date, existingBooking.semesterEndDate, existingBooking.recurringDays)
        : [existingBooking.date];
      
      // Check nếu có ngày trùng
      const hasDateOverlap = datesToCheck.some(date => existingDates.includes(date));
      
      if (hasDateOverlap) {
        // Check time conflict
        return hasTimeConflict(booking, existingBooking);
      }
      
      return false;
    });

    if (hasConflict) {
      return c.json({ error: 'Room is already booked for this time slot' }, 409);
    }

    // Don't store the id in the value, it's in the key
    const { id, ...bookingData } = booking as any;
    const newBooking = {
      ...bookingData,
      status: 'Pending',
      requestDate: new Date().toISOString(),
    };

    await kv.set(bookingId, newBooking);
    return c.json({ success: true, id: bookingId, booking: newBooking });
  } catch (error) {
    console.log('Error creating booking:', error);
    return c.json({ error: 'Failed to create booking' }, 500);
  }
});

app.put(`${prefix}/bookings/:id/status`, async (c) => {
  try {
    const id = c.req.param('id');
    const { status } = await c.req.json();
    
    const booking = await kv.get(id);
    if (!booking) {
      return c.json({ error: 'Booking not found' }, 404);
    }

    const updatedBooking = {
      ...booking,
      status,
    };

    await kv.set(id, updatedBooking);
    return c.json({ success: true, booking: updatedBooking });
  } catch (error) {
    console.log('Error updating booking status:', error);
    return c.json({ error: 'Failed to update booking status' }, 500);
  }
});

app.delete(`${prefix}/bookings/:id`, async (c) => {
  try {
    const id = c.req.param('id');
    const booking = await kv.get(id);
    
    if (!booking) {
      return c.json({ error: 'Booking not found' }, 404);
    }

    // Mark as cancelled instead of deleting
    const updatedBooking = {
      ...booking,
      status: 'Cancelled',
    };

    await kv.set(id, updatedBooking);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error cancelling booking:', error);
    return c.json({ error: 'Failed to cancel booking' }, 500);
  }
});

// Schedule endpoint - get bookings for a date range
app.get(`${prefix}/schedule`, async (c) => {
  try {
    const startDate = c.req.query('startDate');
    const endDate = c.req.query('endDate');
    const campus = c.req.query('campus');

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('kv_store_76deef69')
      .select('key, value')
      .like('key', 'booking:%');
    
    if (error) {
      console.log('Error fetching schedule:', error);
      return c.json({ error: 'Failed to fetch schedule' }, 500);
    }
    
    let allBookings = data?.map((item: any) => ({
      id: item.key,
      ...item.value
    })) || [];
    
    // Filter by date range
    if (startDate && endDate) {
      allBookings = allBookings.filter((b: any) => {
        const bookingDate = b.date;
        return bookingDate >= startDate && bookingDate <= endDate;
      });
    }

    // Filter by campus if specified
    if (campus && campus !== 'all') {
      allBookings = allBookings.filter((b: any) => b.campus === campus);
    }

    // Only return approved bookings for schedule view
    const approvedBookings = allBookings.filter((b: any) => b.status === 'Approved');

    return c.json({ bookings: approvedBookings });
  } catch (error) {
    console.log('Error fetching schedule:', error);
    return c.json({ error: 'Failed to fetch schedule' }, 500);
  }
});

// Analytics endpoint
app.get(`${prefix}/analytics`, async (c) => {
  try {
    const period = c.req.query('period') || 'month';
    const campus = c.req.query('campus');

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('kv_store_76deef69')
      .select('key, value')
      .like('key', 'booking:%');
    
    if (error) {
      console.log('Error fetching analytics:', error);
      return c.json({ error: 'Failed to fetch analytics' }, 500);
    }
    
    let allBookings = data?.map((item: any) => ({
      id: item.key,
      ...item.value
    })) || [];
    
    // Filter by campus if specified
    if (campus && campus !== 'all') {
      allBookings = allBookings.filter((b: any) => b.campus === campus);
    }

    // Calculate statistics
    const totalBookings = allBookings.length;
    const approvedBookings = allBookings.filter((b: any) => b.status === 'Approved').length;
    const approvalRate = totalBookings > 0 ? Math.round((approvedBookings / totalBookings) * 100) : 0;

    // Group by room
    const bookingsByRoom: Record<string, number> = {};
    allBookings.forEach((b: any) => {
      const roomName = b.roomName;
      bookingsByRoom[roomName] = (bookingsByRoom[roomName] || 0) + 1;
    });

    // Group by category
    const bookingsByCategory: Record<string, number> = {};
    allBookings.forEach((b: any) => {
      const category = b.category || 'Unknown';
      bookingsByCategory[category] = (bookingsByCategory[category] || 0) + 1;
    });

    // Group by campus
    const bookingsByCampus: Record<string, number> = {};
    allBookings.forEach((b: any) => {
      const campusName = b.campus === 'FU_FPT' ? 'FU FPT' : 'NVH';
      bookingsByCampus[campusName] = (bookingsByCampus[campusName] || 0) + 1;
    });

    return c.json({
      totalBookings,
      approvalRate,
      bookingsByRoom,
      bookingsByCategory,
      bookingsByCampus,
    });
  } catch (error) {
    console.log('Error fetching analytics:', error);
    return c.json({ error: 'Failed to fetch analytics' }, 500);
  }
});

// Auth endpoints
app.post(`${prefix}/signup`, async (c) => {
  try {
    const { email, password, name, role, campus } = await c.req.json();
    
    // Validate required fields
    if (!email || !password || !name || !role) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Validate email domain for FPTU
    if (!email.endsWith('@fpt.edu.vn') && !email.endsWith('@fe.edu.vn')) {
      return c.json({ error: 'Email must be from FPT University domain (@fpt.edu.vn or @fe.edu.vn)' }, 400);
    }

    const supabase = getSupabaseClient();

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name, 
        role, 
        campus: campus || 'FU_FPT',
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (error) {
      console.log('Error creating user during signup:', error);
      return c.json({ error: error.message }, 400);
    }

    // Store additional user info in KV store
    const userId = `user:${data.user.id}`;
    await kv.set(userId, {
      email,
      name,
      role,
      campus: campus || 'FU_FPT',
      createdAt: new Date().toISOString(),
    });

    return c.json({ 
      success: true, 
      user: {
        id: data.user.id,
        email,
        name,
        role,
        campus: campus || 'FU_FPT',
      }
    });
  } catch (error) {
    console.log('Error during signup:', error);
    return c.json({ error: 'Failed to create account' }, 500);
  }
});

app.post(`${prefix}/signin`, async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: 'Missing email or password' }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_ANON_KEY'),
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log('Error during sign in:', error);
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    // Get user info from KV store
    const userId = `user:${data.user.id}`;
    const userInfo = await kv.get(userId);

    if (!userInfo) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    return c.json({ 
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        ...userInfo,
      },
      session: {
        access_token: data.session.access_token,
      }
    });
  } catch (error) {
    console.log('Error during signin:', error);
    return c.json({ error: 'Failed to sign in' }, 500);
  }
});

// Initialize with sample data if needed
app.post(`${prefix}/init-data`, async (c) => {
  try {
    // Check if data already exists
    const existingRooms = await kv.getByPrefix('room:');
    if (existingRooms.length > 0) {
      return c.json({ message: 'Data already initialized' });
    }

    // Sample rooms - store without id in the value
    const sampleRooms = [
      {
        id: 'room:1',
        name: 'Room 101',
        campus: 'FU_FPT',
        building: 'Building A',
        floor: 1,
        capacity: 40,
        category: 'Classroom',
        amenities: ['Projector', 'Whiteboard', 'AC'],
        status: 'Active',
        images: [
          'https://images.unsplash.com/photo-1757192420329-39acf20a12b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2xhc3Nyb29tJTIwZGVza3N8ZW58MXx8fHwxNzY1NDI3Mjc1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          'https://images.unsplash.com/photo-1757194455393-8e3134d4ce19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjbGFzc3Jvb20lMjBjaGFpcnN8ZW58MXx8fHwxNzY1NDI3Mjc2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          'https://images.unsplash.com/photo-1736066330610-c102cab4e942?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2xhc3Nyb29tJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzY1NDI3Mjc1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          'https://images.unsplash.com/photo-1631885661118-5107a6111772?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2hvb2wlMjBjbGFzc3Jvb20lMjBlbXB0eXxlbnwxfHx8fDE3NjU0MjcyNzZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
        ],
      },
      {
        id: 'room:2',
        name: 'Lab 201',
        campus: 'FU_FPT',
        building: 'Building B',
        floor: 2,
        capacity: 30,
        category: 'Lab',
        amenities: ['Computers', 'Projector', 'AC'],
        status: 'Active',
        images: [
          'https://images.unsplash.com/photo-1569653402334-2e98fbaa80ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wdXRlciUyMGxhYiUyMHVuaXZlcnNpdHl8ZW58MXx8fHwxNzY1NDI1OTExfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          'https://images.unsplash.com/photo-1689236673934-66f8e9d9279b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wdXRlciUyMGxhYiUyMHdvcmtzdGF0aW9uc3xlbnwxfHx8fDE3NjU0MjcyNzZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          'https://images.unsplash.com/photo-1581094271453-1298de1aa392?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwbGFiJTIwY29tcHV0ZXJzfGVufDF8fHx8MTc2NTM5ODMwOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          'https://images.unsplash.com/photo-1690079374922-7f50d5c1a102?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wdXRlciUyMGNsYXNzcm9vbSUyMHJvd3N8ZW58MXx8fHwxNzY1NDI3Mjc3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
        ],
      },
      {
        id: 'room:3',
        name: 'Meeting Room 301',
        campus: 'NVH',
        building: 'Building C',
        floor: 3,
        capacity: 15,
        category: 'Meeting Room',
        amenities: ['TV', 'Conference Phone', 'Whiteboard'],
        status: 'Active',
        images: [
          'https://images.unsplash.com/photo-1570125909961-96fb5f0238ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25mZXJlbmNlJTIwcm9vbSUyMHRhYmxlfGVufDF8fHx8MTc2NTQxOTg5Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          'https://images.unsplash.com/photo-1517502884422-41eaead166d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWV0aW5nJTIwcm9vbSUyMGludGVyaW9yfGVufDF8fHx8MTc2NTQyMDE0MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          'https://images.unsplash.com/photo-1703355685952-03ed19f70f51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBtZWV0aW5nJTIwcm9vbXxlbnwxfHx8fDE3NjU0MjcyNzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          'https://images.unsplash.com/photo-1570125909961-96fb5f0238ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib2FyZHJvb20lMjBjb25mZXJlbmNlJTIwdGFibGV8ZW58MXx8fHwxNzY1MzQwOTczfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
        ],
      },
      {
        id: 'room:4',
        name: 'Lecture Hall A',
        campus: 'FU_FPT',
        building: 'Building A',
        floor: 1,
        capacity: 100,
        category: 'Lecture Hall',
        amenities: ['Projector', 'Sound System', 'AC', 'Microphone'],
        status: 'Maintenance',
        images: [
          'https://images.unsplash.com/photo-1694951558285-e6cc7397be01?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWN0dXJlJTIwaGFsbCUyMHNlYXRzfGVufDF8fHx8MTc2NTQyNzI3OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          'https://images.unsplash.com/photo-1577179269308-b2e290d07ce5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdWRpdG9yaXVtJTIwdW5pdmVyc2l0eSUyMHRoZWF0ZXJ8ZW58MXx8fHwxNzY1NDI3Mjc5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          'https://images.unsplash.com/photo-1761344580244-767bc4e2e8c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWN0dXJlJTIwdGhlYXRlciUyMHJvd3N8ZW58MXx8fHwxNzY1NDI3Mjc5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          'https://images.unsplash.com/photo-1549349807-4575e87c7e6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwYXVkaXRvcml1bSUyMHN0YWdlfGVufDF8fHx8MTc2NTQyNzI3OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
        ],
      },
      {
        id: 'room:5',
        name: 'Study Room 102',
        campus: 'NVH',
        building: 'Library',
        floor: 1,
        capacity: 8,
        category: 'Study Room',
        amenities: ['Whiteboard', 'AC'],
        status: 'Active',
        images: [
          'https://images.unsplash.com/photo-1718327453695-4d32b94c90a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkeSUyMHJvb20lMjBsaWJyYXJ5fGVufDF8fHx8MTc2NTQwODY4Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          'https://images.unsplash.com/photo-1737018363337-c11847e9f39b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaWJyYXJ5JTIwc3R1ZHklMjBzcGFjZXxlbnwxfHx8fDE3NjUzNDcwOTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          'https://images.unsplash.com/photo-1598673633881-f87824191613?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxxdWlldCUyMHN0dWR5JTIwcm9vbXxlbnwxfHx8fDE3NjU0MjcyODB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          'https://images.unsplash.com/photo-1632245168682-cceb47202dc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaWJyYXJ5JTIwcmVhZGluZyUyMHJvb218ZW58MXx8fHwxNzY1NDI3MjgwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
        ],
      },
    ];

    for (const room of sampleRooms) {
      // Don't store the id in the value, it's in the key
      const { id, ...roomData } = room;
      await kv.set(id, roomData);
    }

    return c.json({ success: true, message: 'Sample data initialized' });
  } catch (error) {
    console.log('Error initializing data:', error);
    return c.json({ error: 'Failed to initialize data' }, 500);
  }
});

// ===== STAFF ENDPOINTS =====

// Get all pending bookings for approval
app.get(`${prefix}/staff/bookings/pending`, async (c) => {
  try {
    const bookings = await fetchByPrefix('booking');
    const pendingBookings = bookings.filter((b: any) => b.status === 'Pending');
    return c.json({ bookings: pendingBookings });
  } catch (error) {
    console.log('Error fetching pending bookings:', error);
    return c.json({ error: 'Failed to fetch pending bookings' }, 500);
  }
});

// Get booking history
app.get(`${prefix}/staff/bookings/history`, async (c) => {
  try {
    const bookings = await fetchByPrefix('booking');
    
    // Sort by requestDate descending
    bookings.sort((a: any, b: any) => {
      return new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime();
    });
    
    return c.json({ bookings });
  } catch (error) {
    console.log('Error fetching booking history:', error);
    return c.json({ error: 'Failed to fetch booking history' }, 500);
  }
});

// Cancel booking with notification
app.post(`${prefix}/staff/bookings/:id/cancel`, async (c) => {
  try {
    const id = c.req.param('id');
    const { reason, notifyUser } = await c.req.json();
    
    const booking = await kv.get(id);
    if (!booking) {
      return c.json({ error: 'Booking not found' }, 404);
    }

    const updatedBooking = {
      ...booking,
      status: 'Cancelled',
      cancelledBy: 'staff',
      cancellationReason: reason,
      cancellationDate: new Date().toISOString(),
    };

    await kv.set(id, updatedBooking);
    
    // Create notification for user
    if (notifyUser) {
      const notificationId = `notification:${Date.now()}`;
      await kv.set(notificationId, {
        userId: booking.userId,
        type: 'booking_cancelled',
        message: `Your booking for ${booking.roomName} on ${booking.date} has been cancelled by staff. Reason: ${reason}`,
        bookingId: id,
        createdAt: new Date().toISOString(),
        read: false,
      });
    }

    return c.json({ success: true, booking: updatedBooking });
  } catch (error) {
    console.log('Error cancelling booking:', error);
    return c.json({ error: 'Failed to cancel booking' }, 500);
  }
});

// Create security task
app.post(`${prefix}/staff/security-tasks`, async (c) => {
  try {
    const task = await c.req.json();
    const taskId = `security-task:${Date.now()}`;
    
    const newTask = {
      ...task,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    await kv.set(taskId, newTask);
    return c.json({ success: true, id: taskId, task: newTask });
  } catch (error) {
    console.log('Error creating security task:', error);
    return c.json({ error: 'Failed to create security task' }, 500);
  }
});

// Get all security tasks
app.get(`${prefix}/staff/security-tasks`, async (c) => {
  try {
    const tasks = await fetchByPrefix('security-task');
    return c.json({ tasks });
  } catch (error) {
    console.log('Error fetching security tasks:', error);
    return c.json({ error: 'Failed to fetch security tasks' }, 500);
  }
});

// Get all reports
app.get(`${prefix}/staff/reports`, async (c) => {
  try {
    const reports = await fetchByPrefix('report');
    return c.json({ reports });
  } catch (error) {
    console.log('Error fetching reports:', error);
    return c.json({ error: 'Failed to fetch reports' }, 500);
  }
});

// Update report status
app.put(`${prefix}/staff/reports/:id/status`, async (c) => {
  try {
    const id = c.req.param('id');
    const { status, response } = await c.req.json();
    
    const report = await kv.get(id);
    if (!report) {
      return c.json({ error: 'Report not found' }, 404);
    }

    const updatedReport = {
      ...report,
      status,
      staffResponse: response,
      reviewedAt: new Date().toISOString(),
    };

    await kv.set(id, updatedReport);
    return c.json({ success: true, report: updatedReport });
  } catch (error) {
    console.log('Error updating report status:', error);
    return c.json({ error: 'Failed to update report status' }, 500);
  }
});

// ===== SECURITY ENDPOINTS =====

// Get assigned security tasks
app.get(`${prefix}/security/tasks`, async (c) => {
  try {
    const tasks = await fetchByPrefix('security-task');
    return c.json({ tasks });
  } catch (error) {
    console.log('Error fetching security tasks:', error);
    return c.json({ error: 'Failed to fetch security tasks' }, 500);
  }
});

// Complete security task
app.put(`${prefix}/security/tasks/:id/complete`, async (c) => {
  try {
    const id = c.req.param('id');
    const { notes } = await c.req.json();
    
    const task = await kv.get(id);
    if (!task) {
      return c.json({ error: 'Task not found' }, 404);
    }

    const updatedTask = {
      ...task,
      status: 'Completed',
      completedAt: new Date().toISOString(),
      completionNotes: notes,
    };

    await kv.set(id, updatedTask);
    return c.json({ success: true, task: updatedTask });
  } catch (error) {
    console.log('Error completing task:', error);
    return c.json({ error: 'Failed to complete task' }, 500);
  }
});

// Submit report
app.post(`${prefix}/security/reports`, async (c) => {
  try {
    const report = await c.req.json();
    const reportId = `report:${Date.now()}`;
    
    const newReport = {
      ...report,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    await kv.set(reportId, newReport);
    return c.json({ success: true, id: reportId, report: newReport });
  } catch (error) {
    console.log('Error creating report:', error);
    return c.json({ error: 'Failed to create report' }, 500);
  }
});

// Get approved bookings for security
app.get(`${prefix}/security/bookings/approved`, async (c) => {
  try {
    const bookings = await fetchByPrefix('booking');
    const approvedBookings = bookings.filter((b: any) => b.status === 'Approved');
    return c.json({ bookings: approvedBookings });
  } catch (error) {
    console.log('Error fetching approved bookings:', error);
    return c.json({ error: 'Failed to fetch approved bookings' }, 500);
  }
});

// ===== ADMIN ENDPOINTS =====

// Get all users
app.get(`${prefix}/admin/users`, async (c) => {
  try {
    const users = await fetchByPrefix('user');
    return c.json({ users });
  } catch (error) {
    console.log('Error fetching users:', error);
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

// Update user
app.put(`${prefix}/admin/users/:id`, async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const userId = `user:${id}`;
    const user = await kv.get(userId);
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(userId, updatedUser);
    return c.json({ success: true, user: updatedUser });
  } catch (error) {
    console.log('Error updating user:', error);
    return c.json({ error: 'Failed to update user' }, 500);
  }
});

// Delete/deactivate user
app.delete(`${prefix}/admin/users/:id`, async (c) => {
  try {
    const id = c.req.param('id');
    const userId = `user:${id}`;
    
    const user = await kv.get(userId);
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Mark as inactive instead of deleting
    const updatedUser = {
      ...user,
      status: 'Inactive',
      deactivatedAt: new Date().toISOString(),
    };

    await kv.set(userId, updatedUser);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deactivating user:', error);
    return c.json({ error: 'Failed to deactivate user' }, 500);
  }
});

// Advanced analytics
app.get(`${prefix}/admin/analytics/advanced`, async (c) => {
  try {
    const period = c.req.query('period') || 'month';
    const campus = c.req.query('campus');

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('kv_store_76deef69')
      .select('key, value')
      .like('key', 'booking:%');
    
    if (error) {
      console.log('Error fetching analytics:', error);
      return c.json({ error: 'Failed to fetch analytics' }, 500);
    }
    
    let allBookings = data?.map((item: any) => ({
      id: item.key,
      ...item.value
    })) || [];
    
    // Filter by campus if specified
    if (campus && campus !== 'all') {
      allBookings = allBookings.filter((b: any) => b.campus === campus);
    }

    // Only approved bookings for stats
    const approvedBookings = allBookings.filter((b: any) => b.status === 'Approved');

    // Top rooms by booking count
    const roomCounts: Record<string, { count: number; roomName: string; campus: string }> = {};
    approvedBookings.forEach((b: any) => {
      if (!roomCounts[b.roomId]) {
        roomCounts[b.roomId] = { count: 0, roomName: b.roomName, campus: b.campus };
      }
      roomCounts[b.roomId].count++;
    });
    
    const topRooms = Object.entries(roomCounts)
      .map(([roomId, data]) => ({ roomId, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top time slots
    const slotCounts: Record<string, number> = {};
    approvedBookings.forEach((b: any) => {
      const slot = `${b.startTime}-${b.endTime}`;
      slotCounts[slot] = (slotCounts[slot] || 0) + 1;
    });
    
    const topSlots = Object.entries(slotCounts)
      .map(([slot, count]) => ({ slot, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Category popularity
    const categoryCounts: Record<string, number> = {};
    approvedBookings.forEach((b: any) => {
      const category = b.category || 'Unknown';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    const topCategories = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    return c.json({
      topRooms,
      topSlots,
      topCategories,
      totalApprovedBookings: approvedBookings.length,
    });
  } catch (error) {
    console.log('Error fetching advanced analytics:', error);
    return c.json({ error: 'Failed to fetch advanced analytics' }, 500);
  }
});

// Add room image
app.post(`${prefix}/admin/rooms/:id/images`, async (c) => {
  try {
    const roomId = c.req.param('id');
    const { imageUrl } = await c.req.json();
    
    const room = await kv.get(roomId);
    if (!room) {
      return c.json({ error: 'Room not found' }, 404);
    }

    // Add image to the room's images array
    const currentImages = room.images || [];
    const updatedImages = [...currentImages, imageUrl];
    
    const updatedRoom = {
      ...room,
      images: updatedImages,
    };

    await kv.set(roomId, updatedRoom);
    return c.json({ success: true, room: updatedRoom });
  } catch (error) {
    console.log('Error adding room image:', error);
    return c.json({ error: 'Failed to add room image' }, 500);
  }
});

// Delete room image
app.delete(`${prefix}/admin/rooms/:id/images`, async (c) => {
  try {
    const roomId = c.req.param('id');
    const { imageUrl } = await c.req.json();
    
    const room = await kv.get(roomId);
    if (!room) {
      return c.json({ error: 'Room not found' }, 404);
    }

    // Remove image from the room's images array
    const currentImages = room.images || [];
    const updatedImages = currentImages.filter((img: string) => img !== imageUrl);
    
    const updatedRoom = {
      ...room,
      images: updatedImages,
    };

    await kv.set(roomId, updatedRoom);
    return c.json({ success: true, room: updatedRoom });
  } catch (error) {
    console.log('Error deleting room image:', error);
    return c.json({ error: 'Failed to delete room image' }, 500);
  }
});

Deno.serve(app.fetch);