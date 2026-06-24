// Example for live DOMA website React/Vite frontend

import { useEffect, useState } from 'react';
import { getSiteSection, getActiveRows, createEnquiry } from './lib/domaSupabaseClient';

export function HomeHero() {
  const [hero, setHero] = useState(null);

  useEffect(() => {
    getSiteSection('hero').then(setHero).catch(console.error);
  }, []);

  if (!hero) return null;

  return (
    <section className="hero">
      <p>{hero.badge}</p>
      <h1>{hero.headline}</h1>
      <p>{hero.subtitle}</p>
      <a href={hero.primaryButtonLink}>{hero.primaryButtonText}</a>
      <a href={hero.secondaryButtonLink}>{hero.secondaryButtonText}</a>
    </section>
  );
}

export function ServicesGrid() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    getActiveRows('services').then(setServices).catch(console.error);
  }, []);

  return services.map((service) => (
    <article key={service.id}>
      <h3>{service.title}</h3>
      <p>{service.description}</p>
    </article>
  ));
}

export async function submitContactForm(formValues) {
  return createEnquiry({
    name: formValues.name,
    email: formValues.email,
    phone: formValues.phone,
    service: formValues.service,
    message: formValues.message
  });
}
