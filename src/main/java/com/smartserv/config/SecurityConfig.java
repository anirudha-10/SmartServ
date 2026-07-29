package com.smartserv.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Disable CSRF (Essential for stateless REST APIs)
                .csrf(csrf -> csrf.disable())

                // 2. Configure URL permissions
                .authorizeHttpRequests(auth -> auth
                                // Allow POST for registration (Anyone can register)
//                    .requestMatchers(HttpMethod.POST, "/api/users").permitAll()
//
//                    // Allow GET for fetching all users (For development/testing purposes only!)
//                    .requestMatchers(HttpMethod.GET, "/api/users", "/api/users/getUsers").permitAll()

                                // All other requests require a valid JWT token
                                .anyRequest().permitAll()
                );

        return http.build();
    }

    // 3. Define the PasswordEncoder bean here (You used it in your Service)
    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
