import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, AlertTriangle, RefreshCw, Info } from 'lucide-react';
import { encrypt, decrypt, isValidKeyMatrix, type Matrix, getDeterminant, inverseMatrix } from './crypto/hillCipher';

const App = () => {
  const [text, setText] = useState('HELLO WORLD');
  const [size, setSize] = useState<2 | 3>(2);
  const [matrix, setMatrix] = useState<Matrix>([
    [9, 4],
    [5, 7]
  ]);
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');

  const handleMatrixChange = (r: number, c: number, val: string) => {
    const num = parseInt(val, 10);
    const newMatrix = [...matrix];
    newMatrix[r] = [...newMatrix[r]];
    newMatrix[r][c] = isNaN(num) ? 0 : num;
    setMatrix(newMatrix);
  };

  const handleSizeChange = (newSize: 2 | 3) => {
    setSize(newSize);
    if (newSize === 2) {
      setMatrix([[9, 4], [5, 7]]);
    } else {
      setMatrix([
        [6, 24, 1],
        [13, 16, 10],
        [20, 17, 15]
      ]);
    }
  };

  const isValid = useMemo(() => isValidKeyMatrix(matrix), [matrix]);

  const result = useMemo(() => {
    if (!isValid || !text.trim()) return null;
    try {
      if (mode === 'encrypt') {
        return encrypt(text, matrix);
      } else {
        return decrypt(text, matrix);
      }
    } catch (e) {
      return null;
    }
  }, [text, matrix, isValid, mode]);

  return (
    <div className="min-h-screen p-8 text-white max-w-6xl mx-auto font-sans">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-neon-magenta tracking-tight">
          Algebraic Cryptosystem Visualizer
        </h1>
        <p className="text-gray-400 text-lg">Interactive Hill Cipher Visualization Lab</p>
        <p className="text-neon-magenta text-sm mt-2 font-mono">Developed by Divyanshu Rai</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Controls */}
        <div className="space-y-6 lg:col-span-1">
          {/* Key Matrix Panel */}
          <div className="bg-charcoal/80 border border-neon-blue/30 rounded-xl p-6 shadow-[0_0_15px_rgba(0,255,255,0.1)] backdrop-blur-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-neon-blue flex items-center gap-2">
                <RefreshCw size={20} /> Key Matrix
              </h2>
              <div className="flex bg-dark-navy rounded-lg p-1">
                <button 
                  onClick={() => handleSizeChange(2)} 
                  className={`px-3 py-1 rounded-md text-sm transition-all ${size === 2 ? 'bg-neon-blue text-dark-navy font-bold' : 'text-gray-400 hover:text-white'}`}
                >2x2</button>
                <button 
                  onClick={() => handleSizeChange(3)} 
                  className={`px-3 py-1 rounded-md text-sm transition-all ${size === 3 ? 'bg-neon-blue text-dark-navy font-bold' : 'text-gray-400 hover:text-white'}`}
                >3x3</button>
              </div>
            </div>
            
            <div className="flex justify-center mb-6">
              <div className="grid gap-2 p-4 bg-dark-navy/50 rounded-xl border border-neon-blue/20" 
                style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
                {matrix.map((row, r) => 
                  row.map((val, c) => (
                    <input
                      key={`${r}-${c}`}
                      type="number"
                      value={val}
                      onChange={(e) => handleMatrixChange(r, c, e.target.value)}
                      className="w-14 h-14 bg-charcoal text-center text-xl text-white font-mono rounded-lg border border-gray-700 focus:border-neon-magenta focus:ring-1 focus:ring-neon-magenta focus:outline-none transition-all"
                    />
                  ))
                )}
              </div>
            </div>

            <AnimatePresence>
              {!isValid && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm flex items-start gap-2"
                >
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  <p>Matrix is not invertible modulo 26. Determinant must be coprime with 26.</p>
                </motion.div>
              )}
            </AnimatePresence>

            {isValid && (
              <div className="text-xs text-gray-400 flex justify-between px-2">
                <span>Determinant: {getDeterminant(matrix)}</span>
                <span className="text-neon-blue">Valid Key ✓</span>
              </div>
            )}
          </div>

          {/* Text Input Panel */}
          <div className="bg-charcoal/80 border border-neon-magenta/30 rounded-xl p-6 shadow-[0_0_15px_rgba(255,0,255,0.1)] backdrop-blur-md">
             <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-neon-magenta flex items-center gap-2">
                {mode === 'encrypt' ? <Lock size={20} /> : <Unlock size={20} />} Text Input
              </h2>
              <div className="flex bg-dark-navy rounded-lg p-1">
                <button 
                  onClick={() => setMode('encrypt')} 
                  className={`px-3 py-1 rounded-md text-sm transition-all ${mode === 'encrypt' ? 'bg-neon-magenta text-white font-bold' : 'text-gray-400 hover:text-white'}`}
                >Encrypt</button>
                <button 
                  onClick={() => setMode('decrypt')} 
                  className={`px-3 py-1 rounded-md text-sm transition-all ${mode === 'decrypt' ? 'bg-neon-magenta text-white font-bold' : 'text-gray-400 hover:text-white'}`}
                >Decrypt</button>
              </div>
            </div>
            
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={mode === 'encrypt' ? 'Enter plaintext (A-Z)' : 'Enter ciphertext (A-Z)'}
              className="w-full h-32 bg-dark-navy/50 text-white p-4 rounded-xl border border-gray-700 focus:border-neon-magenta focus:outline-none resize-none font-mono text-lg uppercase tracking-wider"
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Visualization & Output */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-charcoal/80 border border-gray-700/50 rounded-xl p-6 backdrop-blur-md min-h-[300px] flex flex-col">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Info size={20} className="text-neon-purple" /> Math Visualization
            </h2>
            
            {isValid && result && text.trim() ? (
              <div className="flex-1 overflow-x-auto pb-4">
                <div className="flex items-center gap-8 min-w-max px-4">
                  
                  {/* Matrix M */}
                  <div className="flex flex-col items-center">
                    <span className="text-gray-400 mb-2 text-sm">Key {mode === 'decrypt' ? 'Inverse (Mod 26)' : 'Matrix'}</span>
                    <div className="relative p-4 border-l-2 border-r-2 border-neon-purple/70 rounded-sm">
                      <div className="grid gap-x-6 gap-y-2 text-xl font-mono text-white text-right" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
                        {(mode === 'encrypt' ? matrix : inverseMatrix(matrix)).map((row, r) => 
                          row.map((val, c) => (
                            <span key={`${r}-${c}`}>{val}</span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="text-2xl text-gray-500 font-bold">×</span>

                  {/* Vectors Animation Container */}
                  <div className="flex gap-6 overflow-x-auto py-4 snap-x">
                    {result.steps.map((step, idx) => {
                      // Extract the corresponding text slice
                      const rawText = text.toUpperCase().replace(/[^A-Z]/g, "");
                      // If padding is needed
                      const paddedText = rawText.padEnd(Math.ceil(rawText.length / size) * size, 'X');
                      const inChars = paddedText.slice(idx * size, (idx + 1) * size).split('');
                      const inNums = inChars.map(c => c.charCodeAt(0) - 65);
                      const outChars = step.map(n => String.fromCharCode(n + 65));

                      return (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-center gap-4 snap-center shrink-0 bg-dark-navy/60 p-4 rounded-xl border border-gray-800"
                        >
                          {/* Input Vector */}
                          <div className="flex flex-col items-center">
                            <div className="flex gap-2 mb-2 text-neon-blue font-bold">
                              {inChars.map((c, i) => <span key={i}>{c}</span>)}
                            </div>
                            <div className="relative p-2 border-l-2 border-r-2 border-gray-600 rounded-sm">
                              <div className="flex flex-col gap-2 font-mono text-gray-300">
                                {inNums.map((n, i) => <span key={i}>{n}</span>)}
                              </div>
                            </div>
                          </div>
                          
                          <span className="text-neon-magenta/50 text-xl font-bold">→</span>
                          
                          {/* Output Vector */}
                          <div className="flex flex-col items-center">
                            <div className="flex gap-2 mb-2 text-neon-magenta font-bold">
                              {outChars.map((c, i) => <span key={i}>{c}</span>)}
                            </div>
                            <div className="relative p-2 border-l-2 border-r-2 border-neon-magenta/50 rounded-sm">
                              <div className="flex flex-col gap-2 font-mono text-white">
                                {step.map((n, i) => <span key={i}>{n}</span>)}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 italic">
                {!isValid ? 'Matrix is invalid. Enter a valid key to see math steps.' : 'Enter text to visualize matrix multiplication.'}
              </div>
            )}
          </div>

          {/* Output Panel */}
          <div className="bg-charcoal/80 border border-neon-blue/30 rounded-xl p-6 shadow-[0_0_15px_rgba(0,255,255,0.05)] backdrop-blur-md">
             <h2 className="text-xl font-semibold text-white mb-4">
              Result ({mode === 'encrypt' ? 'Ciphertext' : 'Plaintext'})
            </h2>
            <div className="w-full bg-dark-navy/80 min-h-[8rem] text-white p-6 rounded-xl border border-gray-700 font-mono text-2xl uppercase tracking-[0.2em] break-all leading-relaxed shadow-inner">
              {isValid && result ? (
                <motion.div
                  key={result[mode === 'encrypt' ? 'ciphertext' : 'plaintext']}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={mode === 'encrypt' ? 'text-neon-magenta' : 'text-neon-blue'}
                >
                  {result[mode === 'encrypt' ? 'ciphertext' : 'plaintext']}
                </motion.div>
              ) : (
                <span className="text-gray-600">...</span>
              )}
            </div>
          </div>

          {/* Info Panel */}
          <div className="bg-dark-navy/50 border border-gray-800 rounded-xl p-5 text-sm text-gray-400">
            <h3 className="text-white font-semibold mb-2">How Hill Cipher Works</h3>
            <p className="mb-2">
              The Hill cipher uses linear algebra. It maps letters to numbers (A=0, B=1, ... Z=25). 
              A block of letters is treated as a vector and multiplied by a square key matrix, modulo 26.
            </p>
            <p>
              To decrypt, the matrix must be invertible modulo 26. This means its determinant must be non-zero and coprime with 26 (cannot share prime factors 2 or 13).
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;
