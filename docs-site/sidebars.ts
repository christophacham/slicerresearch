import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/prerequisites',
        'getting-started/quick-start',
        'getting-started/hardware',
      ],
    },
    {
      type: 'category',
      label: 'Algorithms',
      items: [
        'algorithms/overview',
        'algorithms/mesh-deformation',
        'algorithms/coordinate-transform',
        'algorithms/field-based',
        'algorithms/multi-axis',
        'algorithms/adaptive-slicing',
        'algorithms/neural-methods',
      ],
    },
    {
      type: 'category',
      label: 'Implementations',
      items: [
        'implementations/overview',
        'implementations/s4-slicer',
        'implementations/s3-slicer',
        'implementations/fullcontrol',
        'implementations/slicer6d',
      ],
    },
    {
      type: 'category',
      label: 'Research Papers',
      items: [
        'papers/index',
        'papers/foundational',
        'papers/core-algorithms',
        'papers/recent-advances',
      ],
    },
    {
      type: 'category',
      label: 'Resources',
      items: [
        'resources/math-foundations',
        'resources/libraries',
      ],
    },
  ],
};

export default sidebars;
