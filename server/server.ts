import { app } from './src/app.ts';
import { PORT } from './src/config.ts';

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
})
