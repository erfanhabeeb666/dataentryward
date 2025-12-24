package com.erfan.warddata.Services;

import com.erfan.warddata.Enums.UserType;
import com.erfan.warddata.Models.User;
import com.erfan.warddata.Models.Ward;
import com.erfan.warddata.Repos.UserRepository;
import com.erfan.warddata.Repos.WardRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final WardRepository wardRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public UserService(UserRepository userRepository, WardRepository wardRepository, PasswordEncoder passwordEncoder,
            AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.wardRepository = wardRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }

    // For SUPER_ADMIN to create generic users
    @Transactional
    public User createUser(User userDTO) {
        User user;
        if (userDTO.getUserType() == null) {
            throw new IllegalArgumentException("User type must be specified");
        }

        switch (userDTO.getUserType()) {
            case WARD_MEMBER:
                user = new com.erfan.warddata.Models.WardMember();
                break;
            case AGENT:
                user = new com.erfan.warddata.Models.FieldAgent();
                break;
            case SUPER_ADMIN:
                user = new com.erfan.warddata.Models.SuperAdmin();
                break;
            default:
                throw new IllegalArgumentException("Invalid user type");
        }

        // Copy properties
        user.setName(userDTO.getName());
        if (userDTO.getEmail() != null) {
            user.setEmail(userDTO.getEmail().trim().toLowerCase());
        }
        user.setMobile(userDTO.getMobile());
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        user.setActive(true);

        // Ensure assigned wards are fetched and set if provided in the input
        if (userDTO.getAssignedWards() != null && !userDTO.getAssignedWards().isEmpty()) {
            java.util.Set<Ward> fetchedWards = new java.util.HashSet<>();
            for (Ward w : userDTO.getAssignedWards()) {
                wardRepository.findById(w.getId()).ifPresent(fetchedWards::add);
            }
            user.setAssignedWards(fetchedWards);
        }

        User savedUser = userRepository.save(user);
        auditLogService.log(null, "CREATE", "USER", savedUser.getId(), null,
                "Created user " + savedUser.getEmail() + " as " + savedUser.getUserType());
        return savedUser;
    }

    // For WARD_MEMBER to create AGENTs
    @Transactional
    public User createAgentForWard(Long creatorId, Long wardId, User agentDto) {
        if (agentDto.getUserType() != UserType.AGENT) {
            throw new RuntimeException("Can only create AGENT users");
        }

        Ward ward = wardRepository.findById(wardId).orElseThrow(() -> new RuntimeException("Ward not found"));

        com.erfan.warddata.Models.FieldAgent agent = new com.erfan.warddata.Models.FieldAgent();
        agent.setName(agentDto.getName());
        if (agentDto.getEmail() != null) {
            agent.setEmail(agentDto.getEmail().trim().toLowerCase());
        }
        agent.setMobile(agentDto.getMobile());
        agent.setPassword(passwordEncoder.encode(agentDto.getPassword()));
        agent.setActive(true);
        agent.setAssignedWards(Set.of(ward)); // Assign to this ward

        User savedAgent = userRepository.save(agent);

        auditLogService.log(creatorId, "CREATE", "USER", savedAgent.getId(), wardId,
                "Created Agent " + savedAgent.getEmail() + " for Ward " + wardId);
        return savedAgent;
    }

    public void assignUserToWards(Long userId, List<Long> wardIds) {
        User user = getUserById(userId);
        List<Ward> wards = wardRepository.findAllById(wardIds);
        user.setAssignedWards(Set.copyOf(wards));
        userRepository.save(user);
    }

    public String getIdfromUsername(String username) {
        String normalizedEmail = username != null ? username.trim().toLowerCase() : null;
        Long userId = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("User not found for username: " + username))
                .getId();
        return userId.toString();
    }

    public User getUserByUsername(String username) {
        String normalizedEmail = username != null ? username.trim().toLowerCase() : null;
        return userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("User not found for username: " + username));
    }

    public List<User> getUsersByRole(UserType role) {
        return userRepository.findByUserType(role);
    }

    public List<User> getUsersByWardAndRole(Long wardId, UserType role) {
        return userRepository.findByAssignedWards_IdAndUserType(wardId, role);
    }

    @Transactional
    public User updateUser(Long id, User userDetails) {
        User user = getUserById(id);
        user.setName(userDetails.getName());
        user.setMobile(userDetails.getMobile());
        // Email usually shouldn't be changed easily as it's the identifier, but if
        // needed:
        if (userDetails.getEmail() != null) {
            String normalizedEmail = userDetails.getEmail().trim().toLowerCase();
            if (!normalizedEmail.equals(user.getEmail())) {
                user.setEmail(normalizedEmail);
            }
        }
        // Password update should be separate typically, but if provided and not empty:
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}
