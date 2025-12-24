package com.erfan.warddata.Security;

import com.erfan.warddata.Enums.Status;
import com.erfan.warddata.Models.User;
import com.erfan.warddata.Repos.UserRepository;
import com.erfan.warddata.Security.Dto.AuthenticationRequest;
import com.erfan.warddata.Security.Dto.AuthenticationResponse;
import com.erfan.warddata.Security.Dto.ExtractEmailDto;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {

    private final UserRepository userRepository;

    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthenticationService(UserRepository userRepository, JwtService jwtService,
            AuthenticationManager authenticationManager, PasswordEncoder passwordEncoder, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    public User registerUser(User registrationDto) {
        try {
            String normalizedEmail = registrationDto.getEmail() != null
                    ? registrationDto.getEmail().trim().toLowerCase()
                    : null;
            if (normalizedEmail == null || normalizedEmail.isEmpty()) {
                throw new RuntimeException("Email is required");
            }
            if (userRepository.existsByEmail(normalizedEmail)) {
                throw new RuntimeException("Email already exists: " + normalizedEmail);
            }
            User user;
            if (registrationDto.getUserType() != null) {
                switch (registrationDto.getUserType()) {
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
                        user = new User(); // Should strictly not happen for defined roles, or use default
                }
            } else {
                throw new RuntimeException("User Type is required");
            }

            user.setEmail(normalizedEmail);
            user.setPassword(passwordEncoder.encode(registrationDto.getPassword()));
            // user.setUserType() is not needed as discriminator handles it, but setting it
            // doesn't hurt if field exists and is ignored by insertable=false.
            // Actually, we must NOT set 'role' column manually if using
            // @DiscriminatorColumn.
            // However, User entity has 'userType' field marked with insertable=false,
            // updatable=false mapping to 'role'.
            // So we just save the entity and Hibernate sets 'role' column from
            // @DiscriminatorValue.

            user.setName(registrationDto.getName());
            user.setActive(true);
            return userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Email already exists: " + registrationDto.getEmail());
        } catch (Exception e) {
            throw new RuntimeException("An error occurred during registration.", e);
        }
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : null;
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        email,
                        request.getPassword()));
        var user = userRepository.findByEmail(email)
                .orElseThrow();

        var jwtToken = jwtService.generateToken(user);
        AuthenticationResponse authenticationResponse = new AuthenticationResponse();
        authenticationResponse.setToken(jwtToken);
        return authenticationResponse;
    }

    public Boolean validateToken(String jwtFromRequest) {
        return jwtService.isTokenExpired(jwtFromRequest);
    }

    public ResponseEntity<Long> getIdFromToken(HttpServletRequest request) {
        String jwtUserId = jwtService.extractId(jwtUtils.getJwtFromRequest(request));
        Long response = Long.valueOf(jwtUserId);
        return ResponseEntity.ok(response);
    }

    public ResponseEntity<String> getEmailFromToken(HttpServletRequest request) {
        String jwtUserEmail = jwtService.extractUsername(jwtUtils.getJwtFromRequest(request));

        return ResponseEntity.ok(jwtUserEmail);
    }

    public ResponseEntity<String> getEmailFromTokenUsingBody(ExtractEmailDto extractEmailDto) {
        String jwtUserEmail = jwtService.extractUsername(extractEmailDto.token);
        return ResponseEntity.ok(jwtUserEmail);

    }

    public ResponseEntity<Long> getIdFromTokenUsingBody(ExtractEmailDto extractEmailDto) {
        String jwtUserId = jwtService.extractId(extractEmailDto.token);
        return ResponseEntity.ok(Long.valueOf(jwtUserId));
    }
}
