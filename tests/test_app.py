import unittest
from app import app

class CalculatorTests(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_home(self):
        self.assertEqual(self.client.get('/').status_code, 200)

    def test_health(self):
        self.assertEqual(self.client.get('/health').json['status'], 'ok')

    def test_operations(self):
        cases = [('12','+','3','15'), ('12','-','3','9'), ('12','*','3','36'), ('12','/','3','4'), ('0.1','+','0.2','0.3')]
        for a, op, b, expected in cases:
            with self.subTest(op=op):
                response = self.client.post('/api/calculate', json={'a':a,'operator':op,'b':b})
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.json['result'], expected)

    def test_divide_by_zero(self):
        response = self.client.post('/api/calculate', json={'a':'5','operator':'/','b':'0'})
        self.assertEqual(response.status_code, 400)
        self.assertIn('cero', response.json['error'])

    def test_bad_input(self):
        for payload in ({'a':'abc','b':'2','operator':'+'}, {'a':'2','b':'3','operator':'**'}, []):
            self.assertEqual(self.client.post('/api/calculate', json=payload).status_code, 400)

if __name__ == '__main__':
    unittest.main()
