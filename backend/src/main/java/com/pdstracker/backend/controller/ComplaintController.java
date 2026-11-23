
package com.pdstracker.backend.controller;

import com.pdstracker.backend.entity.Complaint;
import com.pdstracker.backend.entity.User;
import com.pdstracker.backend.repository.ComplaintRepository;
import com.pdstracker.backend.repository.UserRepository;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {
    "http://127.0.0.1:5500",
    "http://localhost:5500"
})
public class ComplaintController {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;

    public ComplaintController(
            ComplaintRepository complaintRepository,
            UserRepository userRepository) {
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
    }

    // Beneficiary submits a complaint
    @PostMapping("/beneficiary/complaints")
    public ResponseEntity<?> submitComplaint(
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        User user = userRepository
                .findByEmail(authentication.getName())
                .orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "User not found")
            );
        }

        String subject = request.get("subject");
        String description = request.get("description");

        if (subject == null || subject.isBlank()
                || description == null || description.isBlank()) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "Subject and description are required")
            );
        }

        Complaint complaint = new Complaint();
        complaint.setUserId(user.getId());
        complaint.setSubject(subject.trim());
        complaint.setDescription(description.trim());
        complaint.setStatus("PENDING");

        return ResponseEntity.ok(
            complaintRepository.save(complaint)
        );
    }

    // Beneficiary views their own complaints
    @GetMapping("/beneficiary/complaints")
    public ResponseEntity<?> getMyComplaints(
            Authentication authentication) {

        User user = userRepository
                .findByEmail(authentication.getName())
                .orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "User not found")
            );
        }

        return ResponseEntity.ok(
            complaintRepository.findByUserId(user.getId())
        );
    }

    // Admin views all complaints
    @GetMapping("/admin/complaints")
    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    // Admin updates complaint status
    @PutMapping("/admin/complaints/{complaintId}/status")
    public ResponseEntity<?> updateComplaintStatus(
            @PathVariable Integer complaintId,
            @RequestBody Map<String, String> request) {

        Complaint complaint = complaintRepository
                .findById(complaintId)
                .orElse(null);

        if (complaint == null) {
            return ResponseEntity.notFound().build();
        }

        String status = request.get("status");

        if (status == null || !List.of(
                "PENDING",
                "IN_PROGRESS",
                "RESOLVED",
                "REJECTED"
        ).contains(status)) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "Invalid complaint status")
            );
        }

        complaint.setStatus(status);

        return ResponseEntity.ok(
            complaintRepository.save(complaint)
        );
    }
}
