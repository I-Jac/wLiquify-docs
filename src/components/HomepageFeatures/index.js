import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Easy to Use',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default, // Placeholder
    description: (
      <>
        wLiquify is designed from the ground up to be easily installed and
        used to get your liquidity needs sorted out quickly.
      </>
    ),
  },
  {
    title: 'Powerful Features',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default, // Placeholder
    description: (
      <>
        Powered by Solana, wLiquify offers fast, secure, and reliable
        liquidity management with advanced features for both users and developers.
      </>
    ),
  },
  {
    title: 'Community Driven',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default, // Placeholder
    description: (
      <>
        Extend or customize your wLiquify experience. wLiquify is
        open source and driven by its community.
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        {/* <Svg className={styles.featureSvg} role="img" /> */}
        {/* Using a placeholder div for SVG as direct SVG content is complex here */}
        <div className={styles.featureSvgPlaceholder}></div>
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
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