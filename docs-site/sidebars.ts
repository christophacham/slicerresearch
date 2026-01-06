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
        {
          type: 'category',
          label: 'Detailed Summaries',
          items: [
            'papers/CurviSlicer_NYU_2019',
            'papers/S3_Slicer_SIGGRAPH_Asia_2022',
            'papers/QuickCurve_2024_NonPlanar',
            'papers/Geodesic_Distance_Field_Curved_Layer_2020',
            'papers/Continuous_Fiber_Spatial_Printing_2023',
            'papers/Field_Based_Toolpath_Fiber_2021',
            'papers/RoboFDM_ICRA_2017',
            'papers/Reinforced_FDM_MultiAxis_SIGGRAPH_Asia_2020',
            'papers/Open5x_Conformal_Slicing_2022',
            'papers/Optimal_Triangle_Mesh_Slicing',
            'papers/Support_Generation_Curved_Layers_2023',
            'papers/AM_Data_Representations_Survey_2019',
            'papers/Topology_Defects_Correction_2003',
            'papers/Adaptive_Slicing_Contour_2021',
            'papers/Adaptive_Slicing_FDM_Revisited_Hamburg_2017',
            'papers/Ahlers_NonPlanar_Layers_2018',
          ],
        },
        {
          type: 'category',
          label: 'Research Q&A',
          items: [
            'papers/research-qa',
            'papers/pipeline-architecture-questions',
            'papers/mesh-processing-questions',
            'papers/nonplanar-strategies-questions',
            'papers/optimization-methods-questions',
            'papers/toolpath-generation-questions',
            'papers/testing-validation-questions',
          ],
        },
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
