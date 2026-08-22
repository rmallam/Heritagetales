import { UserProfile } from '@clerk/nextjs';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#fcfcfc] py-12 px-4 flex justify-center">
      <UserProfile 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-sm border border-[#e5e5e5] rounded-2xl",
            navbar: "hidden sm:block",
          }
        }}
      />
    </div>
  );
}
