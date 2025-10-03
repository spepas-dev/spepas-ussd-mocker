// src/routes/index.tsx
import { createBrowserRouter } from 'react-router-dom';

import BuyerUssd from '@/pages/BuyerUssd';
import NotFound from '@/pages/NotFound';
import SellerUssd from '@/pages/SellerUssd';

export const routes = [
  { path: '/', element: <BuyerUssd /> },
  { path: 'seller', element: <SellerUssd /> },
  {
    path: '/*',
    element: <NotFound />
  }
];

export const router = createBrowserRouter(routes);
