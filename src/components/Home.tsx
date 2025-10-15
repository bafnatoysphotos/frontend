import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from './ProductCard';
import BannerSlider from './BannerSlider'; // ✅ slider
import '../styles/Home.css';
import { Skeleton } from '@mui/material';
import ErrorMessage from './ErrorMessage';

// ✅ import the floating checkout button
import FloatingCheckoutButton from '../components/FloatingCheckoutButton';

interface Category { _id: string; name: string; }
interface Product {
  _id: string;
  name: string;
  image: string;
  price: number;
  category: { _id: string; name: string };
  bulkPricing: { inner: number; qty: number; price: number }[];
  innerQty: number;
  images?: string[];
}

const Home: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hardcode user role; replace with your auth/user context as needed
  const userRole: 'admin' | 'customer' = 'customer';

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [catRes, prodRes, bannerRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products'),
          api.get('/banners'),
        ]);

        if (catRes.status === 200 && prodRes.status === 200 && bannerRes.status === 200) {
          setCategories(catRes.data);
          setProducts(prodRes.data);
          setBanners(bannerRes.data.map((b: any) => b.imageUrl));
        } else {
          throw new Error('Failed to fetch data');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="home-container">
      <section className="home-hero">
        <div className="home-hero__content">
          <p className="home-hero__eyebrow">Fresh arrivals this week</p>
          <h1 className="home-hero__title">Wholesale shopping, redesigned for delight.</h1>
          <p className="home-hero__subtitle">
            Discover curated collections, transparent pricing and speedy fulfilment tailored for modern retailers.
          </p>
          <div className="home-hero__actions">
            <Link to="/products" className="home-hero__cta home-hero__cta--primary">
              Explore products
            </Link>
            <a href="#categories" className="home-hero__cta home-hero__cta--ghost">
              Browse categories
            </a>
          </div>
          <dl className="home-hero__meta" aria-label="Highlights">
            <div>
              <dt>New arrivals</dt>
              <dd>150+</dd>
            </div>
            <div>
              <dt>Retailers served</dt>
              <dd>2k+</dd>
            </div>
            <div>
              <dt>Dispatch within</dt>
              <dd>48 hrs</dd>
            </div>
          </dl>
        </div>
        <div className="home-hero__art" aria-hidden="true">
          <div className="home-hero__blob home-hero__blob--one" />
          <div className="home-hero__card">
            <span>Seasonal spotlight</span>
            <strong>Up to 35% off</strong>
            <p>Limited batches updated daily</p>
          </div>
          <div className="home-hero__blob home-hero__blob--two" />
        </div>
      </section>

      {banners.length > 0 && <BannerSlider banners={banners} />}

      <section className="category-section" id="categories">
        {error ? (
          <div className="home-error">
            <ErrorMessage
              message={error}
              onRetry={() => window.location.reload()}
            />
          </div>
        ) : loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="category-block">
              <div className="category-header">
                <Skeleton
                  variant="text"
                  width="40%"
                  height={28}
                />
              </div>
              <div className="category-card">
                <div className="product-scroll">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <Skeleton
                      key={j}
                      variant="rectangular"
                      width={160}
                      height={200}
                      sx={{ borderRadius: '16px' }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          categories.map(cat => {
            const items = products.filter(p => p.category._id === cat._id);
            return (
              <div key={cat._id} className="category-block">
                <div className="category-header">
                  <h2 className="category-title">{cat.name}</h2>
                  <Link
                    to={`/products?search=${encodeURIComponent(cat.name)}`}
                    className="category-cta"
                  >
                    View all
                  </Link>
                </div>
                <div className="category-card">
                  <div className="product-scroll">
                    {items.map(product => (
                      <div key={product._id} className="product-link">
                        <ProductCard
                          product={product}
                          userRole={userRole}
                        />
                      </div>
                    ))}
                  </div>
                  {items.length === 0 && (
                    <div className="empty-category-message">
                      No products in this category yet. Check back soon!
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* spacer so content doesn't sit under the floating button */}
      <div style={{ height: 72 }} />

      {/* ✅ floating checkout button */}
      <FloatingCheckoutButton />
    </div>
  );
};

export default Home;
