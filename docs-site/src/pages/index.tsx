import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className={styles.heroTitle}>
          {siteConfig.title}
        </Heading>
        <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--primary button--lg"
            to="/docs/intro">
            Get Started
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="/docs/algorithms/overview">
            Explore Algorithms
          </Link>
        </div>
      </div>
    </header>
  );
}

type FeatureItem = {
  title: string;
  icon: string;
  description: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: '40+ Research Papers',
    icon: '📄',
    description:
      'Comprehensive collection covering mesh deformation, geodesic fields, multi-axis planning, and neural approaches.',
  },
  {
    title: '6 Implementations',
    icon: '🔧',
    description:
      'S4 Slicer, S³ DeformFDM, FullControl, Slicer6D, VoxelMultiAxisAM, and Slic3r NonPlanar.',
  },
  {
    title: 'Algorithm Reference',
    icon: '📐',
    description:
      'Detailed documentation with pseudocode, math formulations, and complexity analysis.',
  },
  {
    title: 'Mesh Deformation',
    icon: '🔄',
    description:
      'CurviSlicer, S³-Slicer, QuickCurve - tetrahedral QP optimization and quaternion fields.',
  },
  {
    title: 'Multi-Axis Planning',
    icon: '🤖',
    description:
      'RoboFDM, Open5x - collision-free paths, inverse kinematics, feed rate compensation.',
  },
  {
    title: 'Neural Methods',
    icon: '🧠',
    description:
      'Neural Slicer, INF-3DP, GNN toolpath - ML approaches for real-time inference.',
  },
];

function Feature({title, icon, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className={styles.featureCard}>
        <div className={styles.featureIcon}>{icon}</div>
        <Heading as="h3" className={styles.featureTitle}>{title}</Heading>
        <p className={styles.featureDescription}>{description}</p>
      </div>
    </div>
  );
}

function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

function HomepageStats(): JSX.Element {
  return (
    <section className={styles.stats}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          Repository Contents
        </Heading>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>40+</div>
            <div className={styles.statLabel}>Research Papers</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>320MB</div>
            <div className={styles.statLabel}>PDF Collection</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>6</div>
            <div className={styles.statLabel}>Implementations</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>7</div>
            <div className={styles.statLabel}>Algorithm Categories</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomepageAlgorithms(): JSX.Element {
  return (
    <section className={styles.algorithms}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          Algorithm Categories
        </Heading>
        <div className={styles.algorithmGrid}>
          <Link to="/docs/algorithms/mesh-deformation" className={styles.algorithmCard}>
            <div className={styles.algorithmTitle}>Mesh Deformation</div>
            <div className={styles.algorithmDesc}>CurviSlicer, S³, QuickCurve</div>
            <code className={styles.complexitySlow}>O(n³) → O(n)</code>
          </Link>
          <Link to="/docs/algorithms/field-based" className={styles.algorithmCard}>
            <div className={styles.algorithmTitle}>Field-Based</div>
            <div className={styles.algorithmDesc}>Geodesic, vector fields</div>
            <code className={styles.complexityMedium}>O(n log n)</code>
          </Link>
          <Link to="/docs/algorithms/multi-axis" className={styles.algorithmCard}>
            <div className={styles.algorithmTitle}>Multi-Axis</div>
            <div className={styles.algorithmDesc}>RoboFDM, Open5x</div>
            <code className={styles.complexityMedium}>O(n²)</code>
          </Link>
          <Link to="/docs/algorithms/neural-methods" className={styles.algorithmCard}>
            <div className={styles.algorithmTitle}>Neural Methods</div>
            <div className={styles.algorithmDesc}>Neural Slicer, INF-3DP</div>
            <code className={styles.complexityFast}>O(n) inference</code>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Comprehensive research on non-planar and curved layer 3D printing algorithms">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <HomepageStats />
        <HomepageAlgorithms />
      </main>
    </Layout>
  );
}
