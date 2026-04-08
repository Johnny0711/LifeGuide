package com.lifeguide.api.service;

import com.lifeguide.api.dto.FitnessLogDto;
import com.lifeguide.api.model.FitnessLog;
import com.lifeguide.api.model.User;
import com.lifeguide.api.repository.FitnessLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FitnessLogService {

    private final FitnessLogRepository fitnessLogRepository;
    private final UserService userService;

    public FitnessLogService(FitnessLogRepository fitnessLogRepository, UserService userService) {
        this.fitnessLogRepository = fitnessLogRepository;
        this.userService = userService;
    }

    public List<FitnessLog> getLogsForUser(String email) {
        User user = userService.getUserByEmail(email);
        return fitnessLogRepository.findByUserOrderByRecordedAtAsc(user);
    }

    @Transactional
    public FitnessLog addLog(String email, FitnessLogDto dto) {
        User user = userService.getUserByEmail(email);
        
        FitnessLog log = new FitnessLog(user, dto.getWeightKg());
        FitnessLog savedLog = fitnessLogRepository.save(log);

        // Update the user's current weight as well
        user.setCurrentWeightKg(dto.getWeightKg());
        
        return savedLog;
    }

    @Transactional
    public FitnessLog updateLog(String email, Long logId, FitnessLogDto dto) {
        FitnessLog log = fitnessLogRepository.findById(logId)
                .orElseThrow(() -> new RuntimeException("Fitness log not found"));
        if (!log.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized");
        }
        log.setWeightKg(dto.getWeightKg());
        
        // Also update user's current weight
        log.getUser().setCurrentWeightKg(dto.getWeightKg());
        
        return fitnessLogRepository.save(log);
    }

    @Transactional
    public void deleteLog(String email, Long logId) {
        FitnessLog log = fitnessLogRepository.findById(logId)
                .orElseThrow(() -> new RuntimeException("Fitness log not found"));
        if (!log.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized");
        }
        fitnessLogRepository.delete(log);
    }
}
