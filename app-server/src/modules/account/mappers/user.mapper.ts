import { User } from '@entities';
import {
  UserOrganizationResponseDto,
  UserProfileResponseDto,
  UserResponseDto,
} from '../dto/user-response.dto';

export class UserMapper {
  /**
   * Maps User entity to UserResponseDto
   */
  static toResponseDto(user: User): UserResponseDto {
    const userResponse: UserResponseDto = {
      id: user.id,
      email: user.email,
      credits: user.credits,
      organizations:
        user.userOrganizations.map((userOrganization) => ({
          id: userOrganization.organization.id,
          name: userOrganization.organization.name,
          role: userOrganization.role,
        })) || [],
    };

    // Map profile if it exists
    if (user.profile) {
      const profileResponse: UserProfileResponseDto = {
        fullName: user.profile.fullName,
        avatarUrl: user.profile.avatarUrl,
      };
      userResponse.profile = profileResponse;
    }

    if (user.activeUserOrganization) {
      const currentOrganizationResponse: UserOrganizationResponseDto = {
        id: user.activeUserOrganization.organization.id,
        name: user.activeUserOrganization.organization.name,
        role: user.activeUserOrganization.role,
      };
      userResponse.activeOrganization = currentOrganizationResponse;
    }

    return userResponse;
  }

  /**
   * Maps multiple User entities to UserResponseDto array
   */
  static toResponseDtoArray(users: User[]): UserResponseDto[] {
    return users.map((user) => this.toResponseDto(user));
  }
}
