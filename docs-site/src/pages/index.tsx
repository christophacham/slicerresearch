import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Get Started
          </Link>
          <Link
            className="button button--outline button--secondary button--lg"
            style={{marginLeft: '1rem'}}
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
  description: JSX.Element;
  link: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: '40+ Research Papers',
    description: (
      <>
        Comprehensive collection of academic papers covering mesh deformation,
        geodesic fields, multi-axis path planning, and neural network approaches.
      </>
    ),
    link: '/docs/papers',
  },
  {
    title: '6 Open Source Implementations',
    description: (
      <>
        S4 Slicer, S³ DeformFDM, FullControl, Slicer6D, VoxelMultiAxisAM,
        and Slic3r NonPlanar - ready to explore and extend.
      </>
    ),
    link: '/docs/implementations/overview',
  },
  {
    title: 'Algorithm Reference',
    description: (
      <>
        Detailed documentation of CurviSlicer, S³-Slicer, QuickCurve,
        geodesic methods, and neural approaches with pseudocode.
      </>
    ),
    link: '/docs/algorithms/overview',
  },
];

function Feature({title, description, link}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="padding-horiz--md">
        <Heading as="h3">
          <Link to={link}>{title}</Link>
        </Heading>
        <p>{description}</p>
      </div>
    </div>
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
        <section className={styles.features}>
          <div className="container">
            <div className="row">
              {FeatureList.map((props, idx) => (
                <Feature key={idx} {...props} />
              ))}
            </div>
          </div>
        </section>

        <section className={styles.algorithms}>
          <div className="container">
            <Heading as="h2" className="text--center margin-bottom--lg">
              Algorithm Categories
            </Heading>
            <div className="row">
              <div className="col col--4">
                <div className={styles.algorithmCard}>
                  <h3>Mesh Deformation</h3>
                  <p>CurviSlicer, S³-Slicer, QuickCurve</p>
                  <code>O(n³) → O(n)</code>
                </div>
              </div>
              <div className="col col--4">
                <div className={styles.algorithmCard}>
                  <h3>Field-Based</h3>
                  <p>Geodesic distance, vector fields</p>
                  <code>O(n log n)</code>
                </div>
              </div>
              <div className="col col--4">
                <div className={styles.algorithmCard}>
                  <h3>Neural Methods</h3>
                  <p>Neural Slicer, INF-3DP, GNN</p>
                  <code>O(n) inference</code>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
