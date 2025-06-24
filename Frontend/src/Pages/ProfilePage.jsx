import { useState } from "react";
import { useAuthStore } from "../Store/UseAuthStore";
import { Camera, Mail, User } from "lucide-react";

const ProfilePage = () => {
  const { authUser, updateProfile, isUpdateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile(base64Image);
    };
  };

  return (
    <div className="h-screen pt-20">
      <div className="max-w-xl mx-auto p-2 py-4">
        <div className="bg-base-300 rounded-xl p-4 space-y-5">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="mt-1 text-base">Your profile information</p>
          </div>
          {/* avatar upload section */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <img
                src={selectedImg || authUser?.profilePicture || "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4"
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdateProfile ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-6 h-6 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdateProfile}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdateProfile
                ? "Uploading..."
                : "Click the camera icon to update your photo"}
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="text-base text-zinc-400 flex items-center gap-2">
                <User className="w-5 h-5" />
                Full Name
              </div>
              <p className="px-4 py-2 bg-base-200 rounded-lg border text-base">
                {authUser?.fullName || "Not provided"}
              </p>
            </div>
            <div className="space-y-1">
              <div className="text-base text-zinc-400 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Address
              </div>
              <p className="px-4 py-2 bg-base-200 rounded-lg border text-base">
                {authUser?.email || "Not provided"}
              </p>
            </div>
          </div>
          <div className="mt-3 bg-base-300 rounded-xl p-4">
            <h2 className="text-lg font-medium mb-2">Account Information</h2>
            <div className="space-y-2 text-base">
              <div className="flex items-center justify-between py-1 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
