import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "../ui/select";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "../ui/dialog";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "../ui/table";
import { Plus, Trash2, Eye, MapPin, Users, Pencil, Save, X } from 'lucide-react';
import { AddRoomDialog } from '../shared/AddRoomDialog';
import { RoomDetailsDialog } from './RoomDetailsDialog';
import { useFacilityManagement } from './useFacilityManagement';
import { toast } from "sonner";
import { roomsApi } from '../../api/api';

// --- INTERFACES ---
// Dữ liệu từ bảng Master Data (Assets)
interface Asset {
  id: number;          // AssetID
  assetName: string;   // AssetName
  assetType: string;   // AssetType
}

// Dữ liệu từ bảng trung gian (FacilityAssets)
interface FacilityAsset {
  id?: number;         // ID của dòng trong bảng FacilityAssets (quan trọng để update/delete)
  assetId: number;     // ID của loại tài sản
  assetName: string;   // Tên hiển thị (map từ bảng Assets)
  quantity: number;
  condition: string;
}

import facilityAssetController from '../../api/api/controllers/facilityAssetController';
import assetsController from '../../api/api/controllers/assetsController';

// Note: use the centralized controllers above instead of raw axios calls. They use the shared apiClient which
// handles baseURL and Authorization headers automatically.



export function FacilityManagement() {
  const {
    loading,
    searchTerm,
    setSearchTerm,
    showAddDialog,
    setShowAddDialog,
    filteredRooms,
    handleAddRoom,
    handleDeleteRoom,
    getStatusBadge,
    getCategoryColor,
    selectedRoom,
    showDetailsDialog,
    handleViewDetails,
    handleCloseDetails,
    loadRooms,
    updateLocalRoom,
  } = useFacilityManagement();

  // --- STATE ---
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // --- FILTERS ---
  const [campusFilter, setCampusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [minCapacity, setMinCapacity] = useState<number | null>(null);
  const clearFilters = () => {
    setCampusFilter('All');
    setCategoryFilter('All');
    setStatusFilter('All');
    setMinCapacity(null);
  };

  // Quản lý Assets
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]); // Dropdown data
  const [roomAssets, setRoomAssets] = useState<FacilityAsset[]>([]);   // Current room assets
  const [initialRoomAssets, setInitialRoomAssets] = useState<FacilityAsset[]>([]); // Snapshot để so sánh khi save
  
  // Form nhỏ thêm asset
  const [newAssetId, setNewAssetId] = useState<string>("");
  const [newAssetQty, setNewAssetQty] = useState<number>(1);

  // Load danh sách asset tổng khi vào trang
  useEffect(() => {
    assetsController.getAll().then(data => {
      const mapped = Array.isArray(data) ? data.map((a: any) => ({
        id: a.assetId || a.AssetID || a.id,
        assetName: a.assetName || a.AssetName,
        assetType: a.assetType || a.AssetType
      })) : [];
      setAvailableAssets(mapped);
    }).catch(e => {
      console.error("Lỗi lấy danh sách Assets tổng:", e);
      setAvailableAssets([]);
    });
  }, []);

  // Compute displayed rooms based on search + filters
  const displayedRooms = filteredRooms.filter((room) => {
    if (!room) return false;
    if (campusFilter !== 'All' && room.campus !== campusFilter) return false;
    if (categoryFilter !== 'All' && room.category !== categoryFilter) return false;
    if (statusFilter !== 'All' && room.status !== statusFilter) return false;
    if (minCapacity !== null && typeof room.capacity === 'number' && room.capacity < minCapacity) return false;
    return true;
  });

  // --- HÀM MỞ FORM EDIT ---
  const handleEditClick = async (room: any) => {
    setEditingRoom({ ...room });
    setIsEditOpen(true);
    
    // Đảm bảo có list asset tổng để map tên
    let currentAvailableAssets = availableAssets;
    if (currentAvailableAssets.length === 0) {
      try {
        const data = await assetsController.getAll();
        currentAvailableAssets = Array.isArray(data) ? data.map((a: any) => ({
          id: a.assetId || a.AssetID || a.id,
          assetName: a.assetName || a.AssetName,
          assetType: a.assetType || a.AssetType
        })) : [];
        setAvailableAssets(currentAvailableAssets);
      } catch (e) {
        console.error('Lỗi lấy danh sách Assets tổng:', e);
        currentAvailableAssets = [];
        setAvailableAssets([]);
      }
    }

    // Lấy asset của phòng từ Backend
    const assetsFromBackend = await facilityAssetController.getAssetsByFacility(room.id);
    
    // Map dữ liệu Backend -> State Frontend
    const formattedAssets: FacilityAsset[] = Array.isArray(assetsFromBackend) ? assetsFromBackend.map((backendAsset: any) => {
      // ID của dòng trong bảng FacilityAssets
      const facilityAssetId = backendAsset.id || backendAsset.ID || backendAsset.Id;
      // ID của loại tài sản
      const assetId = backendAsset.assetId || backendAsset.AssetID || backendAsset.assetID;

      // Tìm tên tài sản dựa vào ID
      const matchedAsset = currentAvailableAssets.find(a => a.id === Number(assetId));

      const assetNameFromAssetObj = backendAsset.asset?.assetName || backendAsset.asset?.AssetName;

      return {
        id: facilityAssetId ? Number(facilityAssetId) : undefined,
        assetId: Number(assetId),
        assetName: assetNameFromAssetObj || (matchedAsset ? matchedAsset.assetName : (backendAsset.assetName || "Unknown")),
        quantity: backendAsset.quantity ?? backendAsset.Quantity ?? 1,
        condition: backendAsset.condition || backendAsset.Condition || 'Good'
      };
    }) : [];
    
    setRoomAssets(formattedAssets);
    // Lưu bản sao để biết cái nào bị xóa sau này
    setInitialRoomAssets(JSON.parse(JSON.stringify(formattedAssets)));
  };

  // --- LOGIC THÊM/XÓA ASSET TRÊN GIAO DIỆN ---
  const handleAddAssetToRoom = () => {
    if (!newAssetId) return;
    const selectedAsset = availableAssets.find(a => a.id === Number(newAssetId));
    if (!selectedAsset) return;

    // Kiểm tra xem đã có chưa
    const existing = roomAssets.find(ra => ra.assetId === selectedAsset.id);
    if (existing) {
      // Nếu có rồi -> Tăng số lượng
      setRoomAssets(prev => prev.map(item => 
        item.assetId === selectedAsset.id 
          ? { ...item, quantity: item.quantity + newAssetQty } 
          : item
      ));
    } else {
      // Nếu chưa -> Thêm mới
      setRoomAssets(prev => [...prev, {
        assetId: selectedAsset.id,
        assetName: selectedAsset.assetName,
        quantity: newAssetQty,
        condition: 'Good'
      }]);
    }
    setNewAssetId("");
    setNewAssetQty(1);
  };

  const handleRemoveAsset = (assetId: number) => {
    setRoomAssets(prev => prev.filter(item => item.assetId !== assetId));
  };

  // --- HÀM SAVE QUAN TRỌNG NHẤT ---
  const handleSaveEdit = async () => {
    if (!editingRoom) return;

    try {
      setIsSaving(true);
      // Map Status cho khớp DB: Inactive -> Disabled
      const statusForBackend = editingRoom.status === 'Inactive' ? 'Disabled' : editingRoom.status;
      const capacity = Number(editingRoom.capacity);

      // Tạo chuỗi amenities hiển thị ở bảng ngoài
      const displayAmenities = roomAssets.map(a => `${a.assetName} (${a.quantity})`);

      // 1. Cập nhật thông tin Facility (Phòng)
      // Log payload to help debug backend validation errors
      const payloadToUpdate = {
        id: editingRoom.id,
        facilityName: editingRoom.name, // BE thường dùng facilityName
        name: editingRoom.name,         // Fallback
        campusId: editingRoom.campus === 'NVH' ? 2 : 1,
        typeId: 1, // Tạm fix cứng hoặc map từ category
        capacity: capacity,
        status: statusForBackend,
        imageUrl: editingRoom.images ? editingRoom.images[0] : "string",
        description: "",
      } as any;

      try {
        await roomsApi.update(String(editingRoom.id), payloadToUpdate);
      } catch (err: any) {
        console.error('Update facility failed - request payload:', payloadToUpdate);
        console.error('Update facility failed - server response:', err?.response || err);
        // Show server-provided message if available
        const serverMessage = err?.response?.data?.message || err?.response?.data || err?.message || 'Update facility failed';
        throw new Error(serverMessage);
      }

      // 2. Xử lý lưu Assets (Diffing Logic)
      
      // A. Tạo mới hoặc Cập nhật
      for (const item of roomAssets) {
        if (item.id) {
            // Có ID -> Đã tồn tại -> Gọi Update
            try {
                await facilityAssetController.updateCondition({ 
                    id: item.id as number, 
                    condition: item.condition, 
                    quantity: item.quantity 
                });
            } catch (e) { console.error(`Lỗi update asset ${item.assetName}:`, e); }
        } else {
            // Không có ID -> Mới thêm vào -> Gọi Create
            try {
                await facilityAssetController.createFacilityAsset({ 
                    facilityId: Number(editingRoom.id), 
                    assetId: item.assetId, 
                    quantity: item.quantity, 
                    condition: item.condition 
                });
            } catch (e) { console.error(`Lỗi create asset ${item.assetName}:`, e); }
        }
      }

      // B. Xóa (Những cái có trong initial nhưng không còn trong roomAssets)
      const currentIds = new Set(roomAssets.map(a => a.id).filter(Boolean));
      for (const initial of initialRoomAssets) {
        if (initial.id && !currentIds.has(initial.id)) {
            // Gọi API Delete
            try {
                await facilityAssetController.deleteFacilityAsset(initial.id);
            } catch (e) { console.error(`Lỗi delete asset ID ${initial.id}:`, e); }
        }
      }

      // 3. Cập nhật giao diện ngay lập tức
      updateLocalRoom({
        id: editingRoom.id,
        name: editingRoom.name,
        campus: editingRoom.campus,
        building: editingRoom.building,
        floor: editingRoom.floor,
        capacity: capacity,
        category: editingRoom.category,
        status: editingRoom.status, // Giữ status frontend
        amenities: displayAmenities, // Hiển thị chuỗi amenities mới
        images: editingRoom.images,
      } as any);

      toast.success('Cập nhật thành công!');
      setIsEditOpen(false);

    } catch (error: any) {
      console.error('Failed to update:', error);
      const serverMsg = error?.message || error?.response?.data?.message || error?.response?.data || null;
      if (error?.response?.status === 401) {
        toast.error('Hết phiên đăng nhập. Vui lòng login lại.');
      } else if (serverMsg) {
        toast.error(String(serverMsg));
      } else {
        toast.error('Cập nhật thất bại. Kiểm tra lại dữ liệu.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const updateEditForm = (field: string, value: any) => {
    setEditingRoom((prev: any) => ({ ...prev, [field]: value }));
  };

  const renderStatusBadge = (status: string) => {
    if (status === 'Inactive' || status === 'Disabled') {
      return <Badge className="bg-red-500 hover:bg-red-600 text-white border-transparent">Inactive</Badge>;
    }
    const variant = getStatusBadge(status);
    if (!variant) return null;
    return <Badge className={variant === 'secondary' ? '' : variant} variant={variant === 'secondary' ? 'secondary' : 'default'}>{status}</Badge>;
  };

  if (loading) return <Card><CardContent className="py-12 text-center text-gray-500">Loading...</CardContent></Card>;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Facility Management</CardTitle>
              <CardDescription>Manage rooms and facilities across both campuses</CardDescription>
            </div>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Room
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <Input placeholder="Search rooms..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-md" />

              {/* Filters */}
              <div className="flex gap-2 items-center">
                <div className="flex flex-col items-center">
                  <Label className="text-xs mb-1">Campus</Label>
                  <Select value={campusFilter} onValueChange={(val: string) => setCampusFilter(val)}>
                    <SelectTrigger className="h-9 w-40"><SelectValue placeholder="All" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      <SelectItem value="FU_FPT">FU FPT</SelectItem>
                      <SelectItem value="NVH">NVH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col items-center">
                  <Label className="text-xs mb-1">Category</Label>
                  <Select value={categoryFilter} onValueChange={(val: string) => setCategoryFilter(val)}>
                    <SelectTrigger className="h-9 w-40"><SelectValue placeholder="All" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      <SelectItem value="Classroom">Classroom</SelectItem>
                      <SelectItem value="Lab">Lab</SelectItem>
                      <SelectItem value="Meeting Room">Meeting Room</SelectItem>
                      <SelectItem value="Lecture Hall">Lecture Hall</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col items-center">
                  <Label className="text-xs mb-1">Status</Label>
                  <Select value={statusFilter} onValueChange={(val: string) => setStatusFilter(val)}>
                    <SelectTrigger className="h-9 w-36"><SelectValue placeholder="All" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col items-center">
                  <Label className="text-xs mb-1">Min Capacity</Label>
                  <Input type="number" className="h-9 w-24" value={minCapacity === null ? '' : String(minCapacity)} onChange={(e) => setMinCapacity(e.target.value ? Number(e.target.value) : null)} />
                </div>

                <div className="flex items-center">
                  <Button variant="outline" onClick={() => clearFilters()} className="h-9 ml-2">Clear</Button>
                </div>
              </div>
            </div>
            
            {/* TABLE CHÍNH */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Room Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead className="hidden md:table-cell">Amenities (Summary)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedRooms.length > 0 ? (
                    displayedRooms.map((room) => (
                      <TableRow key={room.id}>
                        <TableCell className="font-medium">{room.name}</TableCell>
                        <TableCell><Badge className={getCategoryColor(room.category)}>{room.category}</Badge></TableCell>
                        <TableCell>{renderStatusBadge(room.status)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col text-sm text-gray-600">
                            <span className="font-medium">{room.campus === 'FU_FPT' ? 'FU FPT' : 'NVH'}</span>
                            <span className="text-xs text-gray-500">{room.building} - Floor {room.floor}</span>
                          </div>
                        </TableCell>
                        <TableCell><div className="flex items-center gap-2 text-sm"><Users className="h-4 w-4 text-gray-400" />{room.capacity}</div></TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex flex-wrap gap-1 max-w-[250px]">
                            {/* Hiển thị Amenities dạng Badge */}
                            {room.amenities && Array.isArray(room.amenities) && room.amenities.slice(0, 2).map((a:string, i:number) => (
                              <Badge key={i} variant="outline" className="text-[10px] px-1 bg-gray-50">{a}</Badge>
                            ))}
                            {room.amenities && Array.isArray(room.amenities) && room.amenities.length > 2 && <Badge variant="secondary" className="text-[10px] px-1">+{room.amenities.length - 2}</Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleViewDetails(room)}><Eye className="h-4 w-4 text-blue-500" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEditClick(room)}><Pencil className="h-4 w-4 text-orange-500" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteRoom(room.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (<TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">No rooms found</TableCell></TableRow>)}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <AddRoomDialog open={showAddDialog} onClose={() => setShowAddDialog(false)} onAdd={handleAddRoom as any} />
      <RoomDetailsDialog open={showDetailsDialog} onClose={handleCloseDetails} room={selectedRoom} onUpdate={loadRooms} isAdmin={true} />

      {/* --- EDIT DIALOG --- */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Facility</DialogTitle></DialogHeader>
          
          {editingRoom && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Room Name</Label><Input value={editingRoom.name} onChange={(e) => updateEditForm('name', e.target.value)} /></div>
                <div className="space-y-2"><Label>Category</Label>
                  <Select value={editingRoom.category} onValueChange={(val: string) => updateEditForm('category', val)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Classroom">Classroom</SelectItem><SelectItem value="Lab">Lab</SelectItem>
                      <SelectItem value="Meeting Room">Meeting Room</SelectItem><SelectItem value="Hall">Hall</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Campus</Label>
                  <Select value={editingRoom.campus} onValueChange={(val: string) => updateEditForm('campus', val)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="FU_FPT">FU_FPT</SelectItem><SelectItem value="NVH">NVH</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Status</Label>
                  <Select value={editingRoom.status} onValueChange={(val: string) => updateEditForm('status', val)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Building</Label><Input value={editingRoom.building} onChange={(e) => updateEditForm('building', e.target.value)} /></div>
                <div className="space-y-2"><Label>Floor</Label><Input type="number" value={editingRoom.floor} onChange={(e) => updateEditForm('floor', e.target.value)} /></div>
                <div className="space-y-2"><Label>Capacity</Label><Input type="number" value={editingRoom.capacity} onChange={(e) => updateEditForm('capacity', e.target.value)} /></div>
              </div>

              {/* --- PHẦN QUẢN LÝ ASSETS --- */}
              <div className="border rounded-md p-4 bg-gray-50 space-y-3">
                <Label className="text-base font-semibold">Room Assets (Facilities)</Label>
                
                <div className="flex gap-2 items-end">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Asset Type</Label>
                    <Select value={newAssetId} onValueChange={setNewAssetId}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Select asset..." /></SelectTrigger>
                      <SelectContent>
                        {availableAssets.map((asset) => (
                          <SelectItem key={asset.id} value={String(asset.id)}>{asset.assetName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-20 space-y-1">
                    <Label className="text-xs">Qty</Label>
                    <Input type="number" className="h-9" min={1} value={newAssetQty} onChange={(e) => setNewAssetQty(parseInt(e.target.value))} />
                  </div>
                  <Button onClick={handleAddAssetToRoom} size="sm" className="h-9 bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>

                <div className="rounded border bg-white overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="h-8 bg-gray-100">
                        <TableHead className="py-1 h-8">Asset Name</TableHead>
                        <TableHead className="py-1 h-8 w-[80px] text-center">Qty</TableHead>
                        <TableHead className="py-1 h-8 w-[120px] text-center">Condition</TableHead>
                        <TableHead className="py-1 h-8 w-[80px] text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roomAssets.length > 0 ? (
                        roomAssets.map((item) => (
                          <TableRow key={item.assetId} className="h-9">
                            <TableCell className="py-1">{item.assetName}</TableCell>
                            <TableCell className="py-1 text-center font-medium">
                              <Input type="number" min={1} className="h-8 w-20 mx-auto text-center" value={item.quantity} onChange={(e) => {
                                const v = parseInt(e.target.value || '0') || 0;
                                setRoomAssets(prev => prev.map(p => p.assetId === item.assetId ? { ...p, quantity: v } : p));
                              }} />
                            </TableCell>
                            <TableCell className="py-1 text-center">
                              <Input value={item.condition} onChange={(e) => setRoomAssets(prev => prev.map(p => p.assetId === item.assetId ? { ...p, condition: e.target.value } : p))} className="h-8 w-32 mx-auto" />
                            </TableCell>
                            <TableCell className="py-1 text-right">
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 hover:text-red-700" onClick={() => handleRemoveAsset(item.assetId)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow><TableCell colSpan={4} className="text-center text-xs py-4 text-gray-400">No assets assigned</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit} className="bg-orange-500 hover:bg-orange-600" disabled={isSaving}>
              {isSaving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

