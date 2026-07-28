import { NodeGraph, Node, NodePort } from '../types';

export class TemplateService {
  /**
   * Instantiates a pre-packaged template assembly inside a target graph
   */
  public loadChromaKeyTemplate(graphId: string): NodeGraph {
    const inputMediaNode: Node = {
      id: 'node_media_input_1',
      name: 'RAW 4K Media File',
      category: 'media',
      type: 'media_file',
      position: { x: 100, y: 150 },
      inputs: [],
      outputs: [
        { id: 'port_raw_out_1', name: 'image', direction: 'output', type: 'image' }
      ],
      properties: { filePath: 'assets/clip_green_screen.mp4' },
      isBookmarked: true,
    };

    const keyingNode: Node = {
      id: 'node_keyer_1',
      name: 'Chroma Keyer Ultra',
      category: 'keying',
      type: 'chroma_key',
      position: { x: 350, y: 150 },
      inputs: [
        { id: 'port_key_in_1', name: 'input', direction: 'input', type: 'image' },
        { id: 'port_key_color_1', name: 'keyColor', direction: 'input', type: 'color', value: '#00ff00' },
        { id: 'port_tolerance_1', name: 'tolerance', direction: 'input', type: 'number', value: 30 }
      ],
      outputs: [
        { id: 'port_mask_out_1', name: 'mask', direction: 'output', type: 'mask' }
      ],
      properties: { tolerance: 30, spillSuppress: true },
    };

    const blurNode: Node = {
      id: 'node_mask_blur_1',
      name: 'Mask Edge Softener',
      category: 'blur',
      type: 'gaussian_blur',
      position: { x: 600, y: 150 },
      inputs: [
        { id: 'port_blur_in_1', name: 'input', direction: 'input', type: 'mask' },
        { id: 'port_blur_radius_1', name: 'radius', direction: 'input', type: 'number', value: 8 }
      ],
      outputs: [
        { id: 'port_blur_out_1', name: 'image', direction: 'output', type: 'mask' }
      ],
      properties: { radius: 8 },
    };

    const backgroundNode: Node = {
      id: 'node_bg_img_1',
      name: 'Matte Background plate',
      category: 'media',
      type: 'media_file',
      position: { x: 350, y: 350 },
      inputs: [],
      outputs: [
        { id: 'port_bg_out_1', name: 'image', direction: 'output', type: 'image' }
      ],
      properties: { filePath: 'assets/neon_city_bg.png' },
    };

    const mergeNode: Node = {
      id: 'node_comp_merge_1',
      name: 'Blend Compositor Output',
      category: 'merge',
      type: 'blend_merge',
      position: { x: 850, y: 250 },
      inputs: [
        { id: 'port_merge_fg_1', name: 'foreground', direction: 'input', type: 'image' },
        { id: 'port_merge_bg_1', name: 'background', direction: 'input', type: 'image' },
        { id: 'port_merge_mask_1', name: 'mask', direction: 'input', type: 'mask' },
        { id: 'port_merge_mode_1', name: 'mixMode', direction: 'input', type: 'string', value: 'normal' }
      ],
      outputs: [
        { id: 'port_merge_out_1', name: 'image', direction: 'output', type: 'image' }
      ],
      properties: { mixMode: 'normal' },
    };

    const renderOutputNode: Node = {
      id: 'node_render_terminal_1',
      name: 'Terminal Render Comp',
      category: 'rendering',
      type: 'video_writer',
      position: { x: 1100, y: 250 },
      inputs: [
        { id: 'port_render_in_1', name: 'input', direction: 'input', type: 'image' }
      ],
      outputs: [],
      properties: { codec: 'hevc', bitRate: 15000 },
      isBookmarked: true,
    };

    return {
      id: graphId,
      name: 'Automated Studio Green Screen Chroma-Keying',
      nodes: [inputMediaNode, keyingNode, blurNode, backgroundNode, mergeNode, renderOutputNode],
      connections: [
        { id: 'c1', fromNodeId: 'node_media_input_1', fromPortId: 'port_raw_out_1', toNodeId: 'node_keyer_1', toPortId: 'port_key_in_1' },
        { id: 'c2', fromNodeId: 'node_keyer_1', fromPortId: 'port_mask_out_1', toNodeId: 'node_mask_blur_1', toPortId: 'port_blur_in_1' },
        { id: 'c3', fromNodeId: 'node_media_input_1', fromPortId: 'port_raw_out_1', toNodeId: 'node_comp_merge_1', toPortId: 'port_merge_fg_1' },
        { id: 'c4', fromNodeId: 'node_bg_img_1', fromPortId: 'port_bg_out_1', toNodeId: 'node_comp_merge_1', toPortId: 'port_merge_bg_1' },
        { id: 'c5', fromNodeId: 'node_mask_blur_1', fromPortId: 'port_blur_out_1', toNodeId: 'node_comp_merge_1', toPortId: 'port_merge_mask_1' },
        { id: 'c6', fromNodeId: 'node_comp_merge_1', fromPortId: 'port_merge_out_1', toNodeId: 'node_render_terminal_1', toPortId: 'port_render_in_1' }
      ],
      groups: [],
      bookmarks: [
        { id: 'bm1', nodeId: 'node_media_input_1', label: 'Inputs' },
        { id: 'bm2', nodeId: 'node_render_terminal_1', label: 'Outputs' }
      ],
      version: '1.0.0',
    };
  }
}
