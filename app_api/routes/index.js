const express = require('express'); 
const router = express.Router();
const { expressjwt: jwt } = require('express-jwt');
const auth = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'],
  // userProperty: 'req.auth' // 최신 버전에서는 기본값이 req.auth
});

const ctrlLocations = require('../controllers/locations'); 
const ctrlReviews = require('../controllers/reviews'); 
const ctrlAuth = require('../controllers/authentication');


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
    .post(auth, ctrlReviews.reviewsCreate); // 새 리뷰 생성 
router
    .route('/locations/:locationid/reviews/:reviewid') 
    .get(ctrlReviews.reviewsReadOne)       // 특정 리뷰 조회 
    .put(auth, ctrlReviews.reviewsUpdateOne)   // 특정 리뷰 수정
    .delete(auth, ctrlReviews.reviewsDeleteOne); //특정 리뷰 삭제

router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

module.exports = router;