const express = require('express'); 
const router = express.Router();
const ctrlLocations = require('../controllers/locations'); 
const ctrlReviews = require('../controllers/reviews'); 


// locations
router
    .route('/locations') 
    .get(ctrlLocations.locationsListByDistance) // 목록 조회 
    .post(ctrlLocations.locationsCreate);       // 새 장소 생성 

router
    .route('/locations/:locationid') 
    .get(ctrlLocations.locationsReadOne)    // 특정 장소 조회
    .put(ctrlLocations.locationsUpdateOne)  // 특정 장소 수정
    .delete(ctrlLocations.locationsDeleteOne); // 특정 장소 삭제


// reviews
// 리뷰는 Location 아래의 서브 다큐먼트이므로, URL에 :locationid가 포함됨

router
    .route('/locations/:locationid/reviews') 
    .post(ctrlReviews.reviewsCreate); // 새 리뷰 생성 
router
    .route('/locations/:locationid/reviews/:reviewid') 
    .get(ctrlReviews.reviewsReadOne)       // 특정 리뷰 조회 
    .put(ctrlReviews.reviewsUpdateOne)     // 특정 리뷰 수정 
    .delete(ctrlReviews.reviewsDeleteOne); // 특정 리뷰 삭제


module.exports = router; 