import http from 'k6/http';
import { sleep } from 'k6';

const profiles = {
  '100': [
    { duration: '10s', target: 10 },
    { duration: '10s', target: 50 },
    { duration: '10s', target: 100 },
  ],
  '1000': [
    { duration: '10s', target: 100 },
    { duration: '10s', target: 500 },
    { duration: '10s', target: 1000 },
  ],
  '2000': [
    { duration: '10s', target: 100 },
    { duration: '10s', target: 500 },
    { duration: '10s', target: 1000 },
    { duration: '10s', target: 2000 },
  ],
  '5000': [
    { duration: '10s', target: 100 },
    { duration: '20s', target: 1000 },
    { duration: '20s', target: 2000 },
    { duration: '20s', target: 5000 },
  ],
};

const targetProfile = __ENV.PROFILE || '100';

export const options = {
  stages: profiles[targetProfile] || profiles['100'],
};

export default function () {
  http.get('http://localhost:8080/api/load-test');
  sleep(1);
}