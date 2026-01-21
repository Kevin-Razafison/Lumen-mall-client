import { useState } from 'react'
import Header from './components/header/Header'
import Hero from './components/Hero/Hero'
import CategoryNav from './components/Hero/CategoryNav'
import droneImg from '../public/drone-product-image.png'
import ProductCard from './components/ProductCard/ProductCard'

function App() {

  return (
    <> 
      <Header />
      <Hero />
      <CategoryNav />
      <section className="product-section">
        <h2 className="section-title">New Arrivals</h2>
        <div className="product-grid">
          <ProductCard 
            image={droneImg} 
            name="Drone" 
            description="Mesure a merakondroud..." 
            price="20.90" 
          />
        </div>
      </section>
    </>
  )
}

export default App
