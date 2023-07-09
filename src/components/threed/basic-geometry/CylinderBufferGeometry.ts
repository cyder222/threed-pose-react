import * as THREE from 'three';

class CylinderBufferGeometry extends THREE.BufferGeometry {
  parameters: {
    radiusTop: number;
    radiusBottom: number;
    height: number;
    radialSegments: number;
    heightSegments: number;
    openEnded: boolean;
    thetaStart: number;
    thetaLength: number;
  };
  constructor(
    radiusTop = 20,
    radiusBottom = 20,
    height = 100,
    radialSegments = 8,
    heightSegments = 1,
    openEnded = false,
    thetaStart = 0,
    thetaLength = Math.PI * 2,
  ) {
    super();

    this.type = 'CylinderBufferGeometry';

    this.parameters = {
      radiusTop,
      radiusBottom,
      height,
      radialSegments,
      heightSegments,
      openEnded,
      thetaStart,
      thetaLength,
    };

    radiusTop = radiusTop !== undefined ? radiusTop : 20;
    radiusBottom = radiusBottom !== undefined ? radiusBottom : 20;
    height = height !== undefined ? height : 100;

    radialSegments = Math.floor(radialSegments) || 8;
    heightSegments = Math.floor(heightSegments) || 1;

    openEnded = openEnded !== undefined ? openEnded : false;
    thetaStart = thetaStart !== undefined ? thetaStart : 0;
    thetaLength = thetaLength !== undefined ? thetaLength : 2 * Math.PI;

    // used to calculate buffer length
    const vertexCount = calculateVertexCount();
    const indexCount = calculateIndexCount();

    // buffers
    const indices = new THREE.BufferAttribute(
      new (indexCount > 65535 ? Uint32Array : Uint16Array)(indexCount),
      1,
    );
    const vertices = new THREE.BufferAttribute(new Float32Array(vertexCount * 3), 3);
    const normals = new THREE.BufferAttribute(new Float32Array(vertexCount * 3), 3);
    const uvs = new THREE.BufferAttribute(new Float32Array(vertexCount * 2), 2);

    // helper variables
    let index = 0,
      indexOffset = 0;
    const indexArray: any[][] = [];
    const halfHeight = height / 2;

    // generate geometry
    generateTorso();

    if (openEnded === false) {
      if (radiusTop > 0) {
        generateCap(true);
      }
      if (radiusBottom > 0) {
        generateCap(false);
      }
    }

    // build geometry
    this.setIndex(indices);
    this.setAttribute('position', vertices);
    this.setAttribute('normal', normals);
    this.setAttribute('uv', uvs);

    // helper functions
    function calculateVertexCount() {
      let count = (radialSegments + 1) * (heightSegments + 1);

      if (openEnded === false) {
        count += (radialSegments + 1) * 2 + radialSegments * 2;
      }

      return count;
    }

    function calculateIndexCount() {
      let count = radialSegments * heightSegments * 2 * 3;

      if (openEnded === false) {
        count += radialSegments * 2 * 3;
      }

      return count;
    }

    function generateTorso() {
      let x, y;
      const normal = new THREE.Vector3();
      const vertex = new THREE.Vector3();

      const tanTheta = (radiusBottom - radiusTop) / height;

      for (y = 0; y <= heightSegments; y++) {
        const indexRow = [];
        const v = y / heightSegments;

        const radius = v * (radiusBottom - radiusTop) + radiusTop;

        for (x = 0; x <= radialSegments; x++) {
          const u = x / radialSegments;

          vertex.x = radius * Math.sin(u * thetaLength + thetaStart);
          vertex.y = -v * height + halfHeight;
          vertex.z = radius * Math.cos(u * thetaLength + thetaStart);
          vertices.setXYZ(index, vertex.x, vertex.y, vertex.z);

          normal.copy(vertex);

          if (
            (radiusTop === 0 && y === 0) ||
            (radiusBottom === 0 && y === heightSegments)
          ) {
            normal.x = Math.sin(u * thetaLength + thetaStart);
            normal.z = Math.cos(u * thetaLength + thetaStart);
          }

          normal
            .setY(Math.sqrt(normal.x * normal.x + normal.z * normal.z) * tanTheta)
            .normalize();
          normals.setXYZ(index, normal.x, normal.y, normal.z);

          uvs.setXY(index, u, 1 - v);

          indexRow.push(index);
          index++;
        }

        indexArray.push(indexRow);
      }

      for (x = 0; x < radialSegments; x++) {
        for (y = 0; y < heightSegments; y++) {
          const i1 = indexArray[y][x];
          const i2 = indexArray[y + 1][x];
          const i3 = indexArray[y + 1][x + 1];
          const i4 = indexArray[y][x + 1];

          indices.setX(indexOffset, i1);
          indexOffset++;
          indices.setX(indexOffset, i2);
          indexOffset++;
          indices.setX(indexOffset, i4);
          indexOffset++;

          indices.setX(indexOffset, i2);
          indexOffset++;
          indices.setX(indexOffset, i3);
          indexOffset++;
          indices.setX(indexOffset, i4);
          indexOffset++;
        }
      }
    }

    function generateCap(top: boolean) {
      let x;
      const uv = new THREE.Vector2();
      const vertex = new THREE.Vector3();

      const radius = top === true ? radiusTop : radiusBottom;
      const sign = top === true ? 1 : -1;

      const centerIndexStart = index;

      for (x = 1; x <= radialSegments; x++) {
        vertices.setXYZ(index, 0, halfHeight * sign, 0);
        normals.setXYZ(index, 0, sign, 0);

        if (top === true) {
          uv.x = x / radialSegments;
          uv.y = 0;
        } else {
          uv.x = (x - 1) / radialSegments;
          uv.y = 1;
        }

        uvs.setXY(index, uv.x, uv.y);
        index++;
      }

      const centerIndexEnd = index;

      for (x = 0; x <= radialSegments; x++) {
        const u = x / radialSegments;

        vertex.x = radius * Math.sin(u * thetaLength + thetaStart);
        vertex.y = halfHeight * sign;
        vertex.z = radius * Math.cos(u * thetaLength + thetaStart);
        vertices.setXYZ(index, vertex.x, vertex.y, vertex.z);
        normals.setXYZ(index, 0, sign, 0);
        uvs.setXY(index, u, top === true ? 1 : 0);
        index++;
      }

      for (x = 0; x < radialSegments; x++) {
        const c = centerIndexStart + x;
        const i = centerIndexEnd + x;

        if (top === true) {
          indices.setX(indexOffset, i);
          indexOffset++;
          indices.setX(indexOffset, i + 1);
          indexOffset++;
          indices.setX(indexOffset, c);
          indexOffset++;
        } else {
          indices.setX(indexOffset, i + 1);
          indexOffset++;
          indices.setX(indexOffset, i);
          indexOffset++;
          indices.setX(indexOffset, c);
          indexOffset++;
        }
      }
    }
  }
}

export default CylinderBufferGeometry;
