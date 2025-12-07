var request = require('request');
const apiOptions = {
  server: 'http://localhost:3000'
};
if (process.env.NODE_ENV === 'production') {
  apiOptions.server = 'https://loc8r-api-z1td.onrender.com';
}

// request(options, callback) 중 options
const requestOptions = {
  url: `${apiOptions.server}`,
  method: `GET`,
  json: {},
  qs: {
    offset: 20
  }
};

// request(options, callback) 중 callback
request(requestOptions, (err, response, body) => {
  if (err) {
    console.log(err);
  } if (response.statusCode === 200) {
    console.log(body);
  } else {
    console.log(response.statusCode);
  }
});


const renderHomepage = function (req, res, responseBody) {
  let message = null;

  // 1. 응답 바디가 배열인지 확인 (아니라면 API 룩업 에러로 간주)
  if (!(responseBody instanceof Array)) {
    message = "API lookup error";
    responseBody = []; // 뷰가 배열을 기대하므로 빈 배열로 설정
  } else {
    // 2. 응답이 배열이지만 비어 있는 경우 (주변에 장소 없음)
    if (!responseBody.length) {
      message = "No places found nearby";
    }
  }

  res.render('locations-list', {
    title: 'Loc8r - find a place to work with wifi',
    pageHeader: {
      title: 'Loc8r',
      strapline: 'Find places to work with wifi near you!'
    },
    sidebar: "Looking for wifi and a seat? Loc8r helps you find places \
to work when out and about. Perhaps with coffee, cake or a pint? \
Let Loc8r help you find the place you're looking for.",
    locations: responseBody,
    message // 설정된 메시지를 뷰에 전달
  });
};


const homelist = (req, res) => {
  const path = '/api/locations';

  const requestOptions ={
      url:`${apiOptions.server}${path}`,
      method:'GET',
      json:{},
      qs:{
          // lng: 1,
          // lat: 1,
          lng: 127.264051,
          lat: 37.009425,
          maxDistance: 200000
      }
  };
  request(
    requestOptions,
    (err, { statusCode, body }) => { // response 객체 대신 statusCode와 body를 바로 디스트럭처링!
      let data = [];

      // API가 200 상태 코드를 반환하고, 응답 바디에 데이터가 있을 때만 루프(포매팅) 실행
      if (statusCode === 200 && body.length) {
        data = body.map((item) => {
          item.distance = formatDistance(item.distance);
          return item;
        });
      };

      // 에러 여부와 관계없이 renderHomepage에 data를 전달
      renderHomepage(req, res, data);
    }
  );
};

const formatDistance = (distance) => {
  let thisDistance = 0;
  let unit = 'm';
  if(distance >1000){
      thisDistance = parseFloat(distance/1000).toFixed(1);
      unit = 'km';
  }else{
      thisDistance = Math.floor(distance);
  }
  return thisDistance+unit;
};


const renderDetailPage = function (req, res, location) {
  res.render('location-info', {
    title: location.name,
    pageHeader: {
      title: location.name // location.name 사용
    },
    sidebar: {
      context: 'is on Loc8r because it has accessible wifi and \
space to sit down with your laptop and get some work done.',
      callToAction: "If you've been and you like it or if you \
don't please leave a review to help other people just like you."
    },
    // DB에서 받은 Location 객체 전체를 location 변수로 뷰에 전달
    location
  });
};


const showError = (req, res, status) => {
  let title = '';
  let content = '';

  // 404 에러에 대한 특별 메시지
  if (status === 404) {
    title = '404, page not found';
    content = 'Oh dear. Looks like you can\'t find this page. Sorry.';
  }
  // 기타 모든 에러 (500, 403 등)에 대한 일반 메시지
  else {
    title = `${status}, something's gone wrong`;
    content = 'Something, somewhere, has gone just a little bit wrong.';
  }

  // HTTP 상태 코드 설정 후, 공용 템플릿으로 렌더링
  res.status(status);
  res.render('generic-text', {
    title,
    content
  });
};


const getLocationInfo = (req, res, callback) => {
  const path = `/api/locations/${req.params.locationid}`; // API 경로 설정
  const requestOptions = {
    url: `${apiOptions.server}${path}`, // 전체 API URL
    method: 'GET',
    json: {}
  };
  request(
    requestOptions,
    (err, {statusCode}, body ) => {
      let data = body;
      if (statusCode === 200) { // API 호출 성공 (상태 코드 200)
        // 응답 데이터에 좌표 정보가 있다면 포맷팅
        data.coords = {
          lng: body.coords[0],
          lat: body.coords[1]
        };
        callback(req, res, data); // 성공 시 콜백 함수 호출
      } else {
        showError(req, res, statusCode); // 실패 시 에러 페이지 표시
      }
    }
  );
};

const locationInfo = (req, res) => {
  getLocationInfo(req, res,
    (req, res, responseData) => renderDetailPage(req, res, responseData) // 성공 시 renderDetailPage 호출
  );
};

const addReview = (req, res) => {
  getLocationInfo(req, res,
    (req, res, responseData) => renderReviewForm(req, res, responseData) // 성공 시 renderReviewForm 호출
  );
};

const renderReviewForm = function (req, res, { name }) {
  res.render('location-review-form', {
    // API에서 받은 name을 사용하여 title과 pageHeader를 설정
    title: `Review ${name} on Loc8r`,
    pageHeader: { title: `Review ${name}` },
    error: req.query.err
  });
};

const doAddReview = (req, res) => {
  const locationid = req.params.locationid;
  const path = `/api/locations/${locationid}/reviews`;

  const postdata = {
    author: req.body.name,
    rating: parseInt(req.body.rating, 10),
    reviewText: req.body.review
  };

  const requestOptions = {
    url: `${apiOptions.server}${path}`,
    method: 'POST',
    json: postdata
  };

  //aplication lever 의 유효성검사
  if (!postdata.author || !postdata.rating || !postdata.reviewText) {
    res.redirect(`/location/${locationid}/review/new?err=val`);
  } else {
    request(
      requestOptions,
      (err, { statusCode, body }) => {
        const { name } = body;

        if (statusCode === 201) {  //Post의 성공코드 201
          res.redirect(`/location/${locationid}`);
        } else if (statusCode === 400 && name && name === 'ValidationError') {
          res.redirect(`/location/${locationid}/review/new?err=val`);
        } else {
          showError(req, res, statusCode);
        }
      }
    );
  }
};

module.exports = {
  homelist,
  locationInfo,
  addReview,
  doAddReview
};
