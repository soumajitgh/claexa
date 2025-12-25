import { Link } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/auth";

export function AvatarButton() {
  const { currentUser } = useAuth();

  const getInitials = (name?: string): string => {
    if (!name || name.trim() === "") return "U";
    const parts = name.trim().split(" ").filter(Boolean); // Filter out empty strings from multiple spaces
    if (parts.length === 0) return "U";

    // If only one part (e.g., email before '@' or single name)
    if (parts.length === 1 && parts[0]) {
      return parts[0].substring(0, 2).toUpperCase();
    }

    // If multiple parts (e.g., first name and last name)
    if (parts[0] && parts[parts.length - 1]) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }

    return "U"; // Fallback if no suitable initials can be generated
  };

  const userName = currentUser?.profile.fullName || currentUser?.email; // Prioritize displayName
  const userImage = currentUser?.profile?.avatarUrl;

  return (
    <Link to="/account">
      <Avatar className="h-8 w-8 cursor-pointer">
        {userImage ? (
          <AvatarImage src={userImage} alt={userName || "User avatar"} />
        ) : null}
        <AvatarFallback>{getInitials(userName)}</AvatarFallback>
      </Avatar>
    </Link>
  );
}
