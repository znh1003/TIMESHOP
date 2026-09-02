export default function AboutPage() {
  return (
    <div className="container-shell editorial-page">
      <div className="page-hero">
        <span className="eyebrow subdued">ABOUT TIMESHOP</span>
        <h1>Objects with a point of view.</h1>
        <p>We select considered pieces for people who believe the everyday deserves better design.</p>
      </div>
      <img className="editorial-page-image" src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1800&q=80" alt="Warmly designed interior" />
      <div className="editorial-copy-block"><span className="eyebrow subdued">Our philosophy</span><h2>Premium is a feeling of clarity.</h2><p>TIMESHOP is a modern lifestyle collection built around restraint, material quality, and useful beauty. We believe the objects around us can make daily rituals calmer, richer, and more personal.</p></div>
      <div className="story-grid">
        <div className="story-card">
          <h3>Design</h3>
          <p>Objects with identity, proportion, and details that reward attention.</p>
        </div>
        <div className="story-card">
          <h3>Quality</h3>
          <p>Durable materials, refined finishes, and lasting confidence.</p>
        </div>
        <div className="story-card">
          <h3>Lifestyle</h3>
          <p>Pieces that make everyday rituals feel more considered.</p>
        </div>
        <div className="story-card">
          <h3>Exclusivity</h3>
          <p>A distinct point of view without unnecessary noise.</p>
        </div>
      </div>
    </div>
  );
}
