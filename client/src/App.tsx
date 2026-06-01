import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import RestaurantList from './pages/RestaurantList';
import Login from './pages/Login';

export default function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<RestaurantList />} />
                <Route path="/login" element={<Login />} />
            </Route>
        </Routes>
    );
}