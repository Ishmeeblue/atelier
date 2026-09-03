import { useState, useEffect } from 'react';
import { fetchProfile, uploadProfilePhoto } from '../services/api';

export default function Profile() {
  const [modelPhoto, setModelPhoto] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const data = await fetchProfile();
        if (data.model_photo) {
          setModelPhoto(data.model_photo);
        }
      } catch (err) {
        console.error('Failed to load profile photo:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const res = await uploadProfilePhoto(formData);
      setModelPhoto(res.model_photo);
    } catch (err) {
      console.error('Failed to upload model photo:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-8 py-10 font-body">
      <div className="border-b border-line pb-4">
        <h1 className="font-display text-3xl font-semibold text-ink">Profile</h1>
        <p className="mt-1 text-sm text-inksoft">
          Manage your reference model photo for the AI virtual try-on feature.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Model Photo Card */}
        <div className="flex flex-col items-center justify-center rounded-lg border border-line bg-white p-6 text-center shadow-sm">
          <span className="mb-4 text-xs font-medium uppercase tracking-wider text-inksoft">
            Model Reference Photo
          </span>

          <div className="relative flex aspect-[3/4] w-full max-w-xs items-center justify-center overflow-hidden rounded-md border border-line bg-cream/50">
            {isLoading ? (
              <p className="text-xs text-inksoft">Loading photo...</p>
            ) : modelPhoto ? (
              <img
                src={modelPhoto}
                alt="Model Reference"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="p-6 text-center">
                <p className="text-sm font-medium text-inksoft">No reference photo uploaded.</p>
                <p className="mt-1 text-xs text-inksoft/70">
                  Upload a full-body photo in a clear, upright standing pose.
                </p>
              </div>
            )}
          </div>

          <label className="mt-6 cursor-pointer rounded-md bg-wine px-5 py-2 text-sm font-medium text-cream transition-opacity hover:opacity-90">
            <span>
              {isUploading
                ? 'Uploading...'
                : modelPhoto
                ? 'Change Photo'
                : 'Upload Full-Body Photo'}
            </span>
            <input
              type="file"
              accept="image/*"
              disabled={isUploading}
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Photo Guidelines */}
        <div className="flex flex-col justify-center rounded-lg border border-line bg-cream/40 p-6">
          <h3 className="font-display text-lg font-semibold text-ink">Photo Guidelines</h3>
          <p className="mt-2 text-xs leading-relaxed text-inksoft">
            For optimal virtual try-on results, make sure your photo meets the following criteria:
          </p>
          <ul className="mt-4 space-y-2 text-xs text-ink list-disc list-inside">
            <li>Full-body, head-to-toe standing pose</li>
            <li>Clear lighting with a simple background</li>
            <li>Single person in frame</li>
            <li>Unobstructed view of clothing placement</li>
          </ul>
        </div>
      </div>
    </div>
  );
}