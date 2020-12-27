const typescript = require('rollup-plugin-typescript2')
const { terser } = require('rollup-plugin-terser')

const base = (input, outputDir, extension, format) => ({
  input,
  treeshake: false,
  output: {
    format,
    dir: outputDir,
    entryFileNames: c => {
      const filepath = c.facadeModuleId.split('/')
      const filename = filepath[filepath.length - 1]
      const file = filename.split('.')
      file[file.length - 1] = extension
      return file.join('')
    }
  },
  watch: {
    include: './**',
    exclude: [
      'node_modules',
      '**/*.spec.ts'
    ],
    clearScreen: false
  },
  plugins: [
    typescript({ 
      tsconfig: 'tsconfig.build.json',
      useTsconfigDeclarationDir: true
    }),
    terser({
      mangle: {
        properties: {
          regex: /^_/
        },
      },
    }),
  ],
  external: [ '@alshdavid/rxjs' ] 
})

module.exports = [
  base('./src/index.ts', './dist','.js', 'esm'),
]
