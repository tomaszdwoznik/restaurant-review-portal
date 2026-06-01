import 'dotenv/config';
import { createApp } from './app';

const PORT = Number(process.env.PORT) || 3000;

createApp().listen(PORT, () => {
    console.log(`API działa na http://localhost:${PORT}`);
});