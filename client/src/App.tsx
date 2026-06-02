import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import RestaurantList from './pages/RestaurantList';
import Login from './pages/Login';
import RestaurantDetail from './pages/RestaurantDetail';
import AddRestaurant from './pages/AddRestaurant';
import ProtectedRoute from './components/ProtectedRoute';
import SearchReviews from './pages/SearchReviews';
import Register from './pages/Register';

export default function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<RestaurantList />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/search" element={<ProtectedRoute><SearchReviews /></ProtectedRoute>} />
                <Route path="/restaurants/new" element={<ProtectedRoute><AddRestaurant /></ProtectedRoute>} />
                <Route path="/restaurants/:id" element={<RestaurantDetail />} />
            </Route>
        </Routes>
    );
}