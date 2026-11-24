
package com.pdstracker.backend.config;

import com.pdstracker.backend.repository.UserRepository;
import com.pdstracker.backend.security.JwtAuthenticationFilter;
import com.pdstracker.backend.service.JwtService;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter(
            JwtService jwtService,
            UserRepository userRepository) {

        return new JwtAuthenticationFilter(jwtService, userRepository);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter)
            throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            // CORS configuration
            .cors(cors -> cors.configurationSource(request -> {
                var corsConfig =
                    new org.springframework.web.cors.CorsConfiguration();

                corsConfig.setAllowedOrigins(
                    java.util.List.of(
                        "http://127.0.0.1:5500",
                        "http://localhost:5500"
                    )
                );

                corsConfig.setAllowedMethods(
                    java.util.List.of(
                        "GET", "POST", "PUT", "DELETE", "OPTIONS"
                    )
                );

                corsConfig.setAllowedHeaders(
                    java.util.List.of("*")
                );

                return corsConfig;
            }))

            // Stateless JWT authentication
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // Authorization rules
            .authorizeHttpRequests(auth -> auth

                // Public home page and authentication APIs
                .requestMatchers(
                    "/",
                    "/api/auth/register",
                    "/api/auth/login"
                ).permitAll()

                // Admin APIs
                .requestMatchers("/api/admin/**")
                .hasRole("ADMIN")

                // Dealer APIs
                .requestMatchers("/api/dealer/**")
                .hasRole("SHOP_DEALER")

                // Beneficiary APIs
                .requestMatchers("/api/beneficiary/**")
                .hasRole("BENEFICIARY")

                // All remaining APIs require authentication
                .anyRequest().authenticated()
            )

            // Add JWT filter
            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}
