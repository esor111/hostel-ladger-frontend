import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bed, Plus, Edit, Trash2, Users, Settings, Layout, Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";
import { RoomDesigner } from "./RoomDesigner";
import { roomService } from "@/services/roomService";

export const RoomConfiguration = () => {
  const { translations } = useLanguage();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch rooms on component mount
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🏠 Fetching rooms from API...');
      const roomsData = await roomService.getRooms();
      console.log('✅ Rooms fetched:', roomsData);
      setRooms(roomsData);
    } catch (error) {
      console.error('❌ Error fetching rooms:', error);
      setError('Failed to load rooms. Please try again.');
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showRoomDesigner, setShowRoomDesigner] = useState(false);
  const [selectedRoomForDesign, setSelectedRoomForDesign] = useState<string | null>(null);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [newRoom, setNewRoom] = useState({
    name: "",
    roomNumber: "",
    type: "Dormitory",
    bedCount: 1,
    gender: "Mixed",
    baseRate: 12000,
    amenities: []
  });

  const roomTypes = ["Dormitory", "Private", "Capsule"];
  const genderOptions = ["Mixed", "Male", "Female"];
  const availableAmenities = [
    "Wi-Fi", "Lockers", "Reading Light", "Private Bathroom",
    "AC", "TV", "Power Outlet", "Personal Locker", "Bunk Bed"
  ];

  const handleAddRoom = async () => {
    // Validate required fields
    if (!newRoom.name.trim()) {
      toast.error("Room name is required!");
      return;
    }

    if (!newRoom.roomNumber.trim()) {
      toast.error("Room number is required!");
      return;
    }

    // Validate capacity (bedCount)
    if (!newRoom.bedCount || newRoom.bedCount < 1 || newRoom.bedCount > 10) {
      toast.error("Bed count must be between 1 and 10!");
      return;
    }

    // Validate rent (baseRate)
    if (newRoom.baseRate < 0) {
      toast.error("Base rate cannot be negative!");
      return;
    }

    try {
      console.log('🏠 Creating new room via API...');
      const roomData = {
        name: newRoom.name, // Required field for the database
        roomNumber: newRoom.roomNumber,
        type: newRoom.type,
        capacity: Number(newRoom.bedCount), // Ensure it's a number
        rent: Number(newRoom.baseRate), // Ensure it's a number
        status: "Active",
        amenities: newRoom.amenities,
        isActive: true
      };

      console.log('📤 Sending room data:', roomData);
      const createdRoom = await roomService.createRoom(roomData);
      console.log('✅ Room created:', createdRoom);

      // Refresh the rooms list
      await fetchRooms();

      // Reset form
      setNewRoom({
        name: "",
        roomNumber: "",
        type: "Dormitory",
        bedCount: 1,
        gender: "Mixed",
        baseRate: 12000,
        amenities: []
      });
      setShowAddRoom(false);
      toast.success("Room added successfully!");
    } catch (error) {
      console.error('❌ Error creating room:', error);
      const errorMessage = error.message || "Failed to add room. Please try again.";
      toast.error(errorMessage);
    }
  };

  const openRoomDesigner = (roomId: string) => {
    setSelectedRoomForDesign(roomId);
    setShowRoomDesigner(true);
  };

  const handleSaveLayout = async (layout: any) => {
    if (selectedRoomForDesign) {
      try {
        console.log('🎨 Saving room layout via API...');
        await roomService.updateRoom(selectedRoomForDesign, { layout });
        console.log('✅ Room layout saved');

        // Refresh the rooms list to get updated data
        await fetchRooms();

        setShowRoomDesigner(false);
        setSelectedRoomForDesign(null);
        toast.success("Room layout saved successfully!");
      } catch (error) {
        console.error('❌ Error saving room layout:', error);
        toast.error("Failed to save room layout. Please try again.");
      }
    }
  };

  const closeRoomDesigner = () => {
    setShowRoomDesigner(false);
    setSelectedRoomForDesign(null);
  };

  const handleEditRoom = (room: any) => {
    setEditingRoom(room);
    setNewRoom({
      name: room.name,
      roomNumber: room.roomNumber || "",
      type: room.type,
      bedCount: room.bedCount,
      gender: room.gender,
      baseRate: room.monthlyRate || room.baseRate,
      amenities: room.amenities || []
    });
    setShowAddRoom(true);
  };

  const handleUpdateRoom = async () => {
    if (!editingRoom) return;

    // Validate required fields
    if (!newRoom.name.trim()) {
      toast.error("Room name is required!");
      return;
    }

    if (!newRoom.roomNumber.trim()) {
      toast.error("Room number is required!");
      return;
    }

    // Validate capacity (bedCount)
    if (!newRoom.bedCount || newRoom.bedCount < 1 || newRoom.bedCount > 10) {
      toast.error("Bed count must be between 1 and 10!");
      return;
    }

    // Validate rent (baseRate)
    if (newRoom.baseRate < 0) {
      toast.error("Base rate cannot be negative!");
      return;
    }

    try {
      console.log('🏠 Updating room via API...');
      const roomData = {
        name: newRoom.name, // Required field for the database
        roomNumber: newRoom.roomNumber,
        type: newRoom.type,
        capacity: Number(newRoom.bedCount), // Ensure it's a number
        rent: Number(newRoom.baseRate), // Ensure it's a number
        status: "Active",
        amenities: newRoom.amenities,
        isActive: true
      };

      console.log('📤 Sending room update data:', roomData);
      await roomService.updateRoom(editingRoom.id, roomData);
      console.log('✅ Room updated');

      // Refresh the rooms list
      await fetchRooms();

      // Reset form and editing state
      setNewRoom({
        name: "",
        roomNumber: "",
        type: "Dormitory",
        bedCount: 1,
        gender: "Mixed",
        baseRate: 12000,
        amenities: []
      });
      setEditingRoom(null);
      setShowAddRoom(false);
      toast.success("Room updated successfully!");
    } catch (error) {
      console.error('❌ Error updating room:', error);
      const errorMessage = error.message || "Failed to update room. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleDeleteRoom = async (room: any) => {
    if (!confirm(`Are you sure you want to delete "${room.name}"? This will mark it as inactive.`)) {
      return;
    }

    try {
      console.log('🗑️ Deleting room via API...');
      await roomService.deleteRoom(room.id);
      console.log('✅ Room deleted');

      // Refresh the rooms list
      await fetchRooms();

      toast.success("Room deleted successfully!");
    } catch (error) {
      console.error('❌ Error deleting room:', error);
      toast.error("Failed to delete room. Please try again.");
    }
  };

  const cancelEdit = () => {
    setEditingRoom(null);
    setNewRoom({
      name: "",
      roomNumber: "",
      type: "Dormitory",
      bedCount: 1,
      gender: "Mixed",
      baseRate: 12000,
      amenities: []
    });
    setShowAddRoom(false);
  };

  if (showRoomDesigner && selectedRoomForDesign) {
    const roomData = rooms.find(r => r.id === selectedRoomForDesign);
    return (
      <RoomDesigner
        onSave={handleSaveLayout}
        onClose={closeRoomDesigner}
        roomData={roomData?.layout}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading rooms...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchRooms} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{translations.rooms}</h2>
        <Button onClick={() => setShowAddRoom(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add New Room
        </Button>
      </div>

      {showAddRoom && (
        <Card>
          <CardHeader>
            <CardTitle>{editingRoom ? 'Edit Room' : 'Add New Room'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Room Name</Label>
                <Input
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                  placeholder="e.g., Dorm A - Mixed"
                />
              </div>
              <div className="space-y-2">
                <Label>Room Number <span className="text-red-500">*</span></Label>
                <Input
                  value={newRoom.roomNumber}
                  onChange={(e) => setNewRoom({ ...newRoom, roomNumber: e.target.value })}
                  placeholder="e.g., A-101, B-205, C-301"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Room Type</Label>
                <Select value={newRoom.type} onValueChange={(value) => setNewRoom({ ...newRoom, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Dormitory", "Private", "Capsule"].map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Bed Count</Label>
                <Input
                  type="number"
                  value={newRoom.bedCount}
                  onChange={(e) => setNewRoom({ ...newRoom, bedCount: parseInt(e.target.value) || 1 })}
                  min="1"
                  max="10"
                />
              </div>
              <div className="space-y-2">
                <Label>Gender Type</Label>
                <Select value={newRoom.gender} onValueChange={(value) => setNewRoom({ ...newRoom, gender: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Mixed", "Male", "Female"].map((gender) => (
                      <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Base Monthly Rate (NPR per month)</Label>
                <Input
                  type="number"
                  value={newRoom.baseRate}
                  onChange={(e) => setNewRoom({ ...newRoom, baseRate: parseFloat(e.target.value) || 0 })}
                  min="0"
                  placeholder="e.g., 8000"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={editingRoom ? handleUpdateRoom : handleAddRoom}>
                {editingRoom ? 'Update Room' : 'Add Room'}
              </Button>
              <Button variant="outline" onClick={editingRoom ? cancelEdit : () => setShowAddRoom(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {rooms.map((room) => (
          <Card key={room.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bed className="h-5 w-5" />
                    {room.name}
                  </CardTitle>
                  {room.roomNumber && (
                    <p className="text-sm text-gray-600 mt-1">Room #{room.roomNumber}</p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">{room.type}</Badge>
                    <Badge variant="outline">{room.gender}</Badge>
                    <Badge className={getStatusColor(room.status)}>
                      {room.status}
                    </Badge>
                    {room.layout && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        Layout Designed
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openRoomDesigner(room.id)}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    <Layout className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditRoom(room)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteRoom(room)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {room.bedCount} beds
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {room.occupancy}/{room.bedCount} occupied
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Monthly Rate</div>
                  <div className="text-xl font-bold text-blue-600">
                    NPR {(room.monthlyRate || room.baseRate || 0).toLocaleString()}/month
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Daily: NPR {room.dailyRate || Math.round((room.monthlyRate || room.baseRate || 0) / 30)}/day
                  </div>
                </div>

                {room.layout && (
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-sm text-purple-600 mb-1">Room Layout</div>
                    <div className="text-sm text-gray-600">
                      {room.layout.dimensions?.length}m × {room.layout.dimensions?.width}m
                      <br />
                      {room.layout.elements?.length || 0} elements configured
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Amenities</div>
                  <div className="flex flex-wrap gap-1">
                    {room.amenities.map((amenity) => (
                      <Badge key={amenity} variant="secondary" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(room.occupancy / room.bedCount) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 text-center">
                  {Math.round((room.occupancy / room.bedCount) * 100)}% Occupancy
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

function getStatusColor(status: string) {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-700";
    case "Maintenance":
      return "bg-yellow-100 text-yellow-700";
    case "Inactive":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}
