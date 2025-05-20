package backend.learningProgress.repository;

import backend.learningProgress.model.LearningProgressModel;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.Date;
import java.util.List;

public interface LearningProgressRepository extends MongoRepository<LearningProgressModel, String> {
    void deleteByPostOwnerID(String postOwnerID); // Ensure this method exists


    @Query("{ 'postOwnerID': ?0, 'date': { $gte: ?1, $lte: ?2 } }")
    List<LearningProgressModel> findByPostOwnerIDAndDateRange(String postOwnerID, Date startDate, Date endDate);

}
