export type Matrix = number[][];

// Helper: Modulo that handles negative numbers correctly
export const mod = (n: number, m: number = 26) => {
  return ((n % m) + m) % m;
};

// Calculate modular inverse of a mod m
export const modInverse = (a: number, m: number = 26): number | null => {
  a = mod(a, m);
  for (let x = 1; x < m; x++) {
    if ((a * x) % m === 1) {
      return x;
    }
  }
  return null;
};

// Determinant of a 2x2 matrix
export const det2x2 = (matrix: Matrix): number => {
  return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
};

// Determinant of a 3x3 matrix
export const det3x3 = (matrix: Matrix): number => {
  return (
    matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1]) -
    matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]) +
    matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0])
  );
};

export const getDeterminant = (matrix: Matrix): number => {
  if (matrix.length === 2) return mod(det2x2(matrix));
  if (matrix.length === 3) return mod(det3x3(matrix));
  throw new Error("Only 2x2 and 3x3 matrices are supported");
};

export const isValidKeyMatrix = (matrix: Matrix): boolean => {
  const det = getDeterminant(matrix);
  return det !== 0 && modInverse(det) !== null;
};

// Adjugate (adjoint) of a 2x2 matrix
export const adj2x2 = (matrix: Matrix): Matrix => {
  return [
    [matrix[1][1], -matrix[0][1]],
    [-matrix[1][0], matrix[0][0]],
  ];
};

// Adjugate (adjoint) of a 3x3 matrix
export const adj3x3 = (matrix: Matrix): Matrix => {
  return [
    [
      matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1],
      -(matrix[0][1] * matrix[2][2] - matrix[0][2] * matrix[2][1]),
      matrix[0][1] * matrix[1][2] - matrix[0][2] * matrix[1][1],
    ],
    [
      -(matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]),
      matrix[0][0] * matrix[2][2] - matrix[0][2] * matrix[2][0],
      -(matrix[0][0] * matrix[1][2] - matrix[0][2] * matrix[1][0]),
    ],
    [
      matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0],
      -(matrix[0][0] * matrix[2][1] - matrix[0][1] * matrix[2][0]),
      matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0],
    ],
  ];
};

// Calculate inverse of matrix mod 26
export const inverseMatrix = (matrix: Matrix): Matrix => {
  const det = getDeterminant(matrix);
  const invDet = modInverse(det);
  
  if (invDet === null) {
    throw new Error("Matrix is not invertible mod 26");
  }

  let adj: Matrix;
  if (matrix.length === 2) {
    adj = adj2x2(matrix);
  } else if (matrix.length === 3) {
    adj = adj3x3(matrix);
  } else {
    throw new Error("Unsupported matrix size");
  }

  return adj.map(row => row.map(val => mod(val * invDet)));
};

// Convert string to array of numbers (A=0, B=1...)
export const textToNumbers = (text: string): number[] => {
  return text
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .split("")
    .map((char) => char.charCodeAt(0) - 65);
};

// Convert array of numbers to string
export const numbersToText = (numbers: number[]): string => {
  return numbers.map((n) => String.fromCharCode(mod(n) + 65)).join("");
};

// Multiply matrix by vector mod 26
export const multiplyVector = (matrix: Matrix, vector: number[]): number[] => {
  const result: number[] = [];
  for (let i = 0; i < matrix.length; i++) {
    let sum = 0;
    for (let j = 0; j < matrix.length; j++) {
      sum += matrix[i][j] * vector[j];
    }
    result.push(mod(sum));
  }
  return result;
};

// Encrypt plaintext with key matrix
export const encrypt = (plaintext: string, keyMatrix: Matrix): { ciphertext: string, steps: number[][] } => {
  const numbers = textToNumbers(plaintext);
  const n = keyMatrix.length;
  
  // Pad with 'X' (23) if length is not a multiple of n
  while (numbers.length % n !== 0) {
    numbers.push(23); 
  }

  const steps: number[][] = [];
  const cipherNumbers: number[] = [];

  for (let i = 0; i < numbers.length; i += n) {
    const vector = numbers.slice(i, i + n);
    const resultVector = multiplyVector(keyMatrix, vector);
    steps.push(resultVector);
    cipherNumbers.push(...resultVector);
  }

  return { ciphertext: numbersToText(cipherNumbers), steps };
};

// Decrypt ciphertext with key matrix
export const decrypt = (ciphertext: string, keyMatrix: Matrix): { plaintext: string, steps: number[][] } => {
  const invMatrix = inverseMatrix(keyMatrix);
  const numbers = textToNumbers(ciphertext);
  const n = keyMatrix.length;

  const steps: number[][] = [];
  const plainNumbers: number[] = [];

  for (let i = 0; i < numbers.length; i += n) {
    const vector = numbers.slice(i, i + n);
    const resultVector = multiplyVector(invMatrix, vector);
    steps.push(resultVector);
    plainNumbers.push(...resultVector);
  }

  return { plaintext: numbersToText(plainNumbers), steps };
};
