package com.smartserv.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartserv.dto.CreateUserDto;
import com.smartserv.dto.UserResponseDto;
import com.smartserv.entity.User;
import com.smartserv.repository.UserRepository;
import com.smartserv.security.JwtUtils;
import com.smartserv.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody @Valid CreateUserDto dto) {
        UserResponseDto created = userService.createUser(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest, jakarta.servlet.http.HttpServletResponse httpResponse) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        if (email == null || email.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email and password are required");
        }

        String cleanEmail = email.trim().toLowerCase();
        User user = userRepo.findByEmail(cleanEmail)
                .orElse(null);

        if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        }

        if (!user.isActive()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("User account is deactivated");
        }

        String token = jwtUtils.generateToken(user);

        // Set token in HttpOnly cookie
        jakarta.servlet.http.Cookie cookie = new jakarta.servlet.http.Cookie("jwt", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // In production, this should be true for HTTPS
        cookie.setPath("/");
        cookie.setMaxAge(24 * 60 * 60); // 1 day
        httpResponse.addCookie(cookie);

        Map<String, Object> response = new HashMap<>();
        
        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId());
        userData.put("userId", user.getId());
        userData.put("email", user.getEmail());
        userData.put("role", user.getUserRole() != null ? user.getUserRole().name() : "CUSTOMER");
        userData.put("userName", user.getUserName());
        userData.put("mobile", user.getMobile());
        response.put("user", userData);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(jakarta.servlet.http.HttpServletResponse httpResponse) {
        jakarta.servlet.http.Cookie cookie = new jakarta.servlet.http.Cookie("jwt", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        httpResponse.addCookie(cookie);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}
