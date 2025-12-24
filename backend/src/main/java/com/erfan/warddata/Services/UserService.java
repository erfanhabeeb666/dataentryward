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
    public User createUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setActive(true);
        User savedUser = userRepository.save(user);
        auditLogService.log(null, "CREATE", "USER", savedUser.getId(), null, "Created user " + savedUser.getEmail());
        return savedUser;
    }

    // For WARD_MEMBER to create AGENTs
    @Transactional
    public User createAgentForWard(Long creatorId, Long wardId, User agentDto) {
        if (agentDto.getUserType() != UserType.AGENT) {
            throw new RuntimeException("Can only create AGENT users");
        }

        Ward ward = wardRepository.findById(wardId).orElseThrow(() -> new RuntimeException("Ward not found"));

        agentDto.setPassword(passwordEncoder.encode(agentDto.getPassword())); // Set default or provided password
        agentDto.setActive(true);
        agentDto.setAssignedWards(Set.of(ward)); // Assign to this ward

        User savedAgent = userRepository.save(agentDto);

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
        Long userId = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found for username: " + username))
                .getId();
        return userId.toString();
    }

    public User getUserByUsername(String username) {
        return userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found for username: " + username));
    }
}
