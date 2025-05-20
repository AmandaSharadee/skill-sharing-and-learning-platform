package backend.learningProgress.controller;

import backend.exception.ResourceNotFoundException;
import backend.learningProgress.model.LearningProgressModel;
import backend.learningProgress.repository.LearningProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@RestController
@CrossOrigin("http://localhost:3000")
public class LearningProgressController {
    @Autowired
    private LearningProgressRepository learningProgressRepository;
    private final Path root = Paths.get("uploads/learningprogress");
    //Insert
    @PostMapping("/learningprogress")
    public LearningProgressModel newAchievementsModel(@RequestBody LearningProgressModel newLearningProgressModel) {
        return learningProgressRepository.save(newLearningProgressModel);
    }

    @PostMapping("/learningprogress/upload")
    public String uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            String extension = file.getOriginalFilename()
                    .substring(file.getOriginalFilename().lastIndexOf("."));
            String filename = UUID.randomUUID() + extension;
            Files.copy(file.getInputStream(), this.root.resolve(filename));
            return filename; // Returns just the random filename
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload image: " + e.getMessage());
        }
    }

    @GetMapping("/learningprogress")
    List<LearningProgressModel> getAll() {
        return learningProgressRepository.findAll();
    }

    @GetMapping("/learningprogress/{id}")
    LearningProgressModel getById(@PathVariable String id) {
        return learningProgressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(id));
    }

    @PutMapping("/learningprogress/{id}")
    LearningProgressModel update(@RequestBody LearningProgressModel newLearningProgressModel, @PathVariable String id) {
        return learningProgressRepository.findById(id)
                .map(learningProgressModel -> {
                    learningProgressModel.setTitle(newLearningProgressModel.getTitle());
                    learningProgressModel.setDescription(newLearningProgressModel.getDescription());
                    learningProgressModel.setPostOwnerID(newLearningProgressModel.getPostOwnerID());
                    learningProgressModel.setPostOwnerName(newLearningProgressModel.getPostOwnerName());
                    learningProgressModel.setDate(newLearningProgressModel.getDate());
                    learningProgressModel.setCategory(newLearningProgressModel.getCategory());
                    learningProgressModel.setImageUrl(newLearningProgressModel.getImageUrl());
                    return learningProgressRepository.save(learningProgressModel);
                }).orElseThrow(() -> new ResourceNotFoundException(id));
    }

    @DeleteMapping("/learningprogress/{id}")
    public void delete(@PathVariable String id) {
        learningProgressRepository.deleteById(id);
    }

    @GetMapping("/learningprogress/images/{filename:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        try {
            Path file = root.resolve(filename);
            Resource resource = new UrlResource(file.toUri());
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(resource);
        } catch (Exception e) {
            throw new RuntimeException("Error loading image: " + e.getMessage());
        }
    }
    @GetMapping("/learningprogress/report/{userId}")
    public List<LearningProgressModel> getLearningProgress(
            @PathVariable String userId,
            @RequestParam String startDate,
            @RequestParam String endDate) throws ParseException {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        Date start = sdf.parse(startDate);

        Calendar cal = Calendar.getInstance();
        cal.setTime(sdf.parse(endDate));
        cal.set(Calendar.HOUR_OF_DAY, 23);
        cal.set(Calendar.MINUTE, 59);
        cal.set(Calendar.SECOND, 59);
        cal.set(Calendar.MILLISECOND, 999);
        Date adjustedEnd = cal.getTime();

        return learningProgressRepository.findByPostOwnerIDAndDateRange(userId, start, adjustedEnd);

    }
}
