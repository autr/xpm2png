const jimp = require('jimp')
const fs = require('fs')

module.exports = async function( url, debug ) {

	const buffer = await fs.readFileSync( url )
	const xpm = buffer.toString()

	const hexToRgb = (hex) => {
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
		} : null;
	}

	let colors = {}
	let config = null

	let a = xpm.indexOf( '= {')
	if (a == -1) xpm.indexOf( '={')
	let b = xpm.lastIndexOf( '};')
	if (b == -1) xpm.lastIndexOf( '}')
	if ( b < a ) return console.error('[xpm.js] could not find start and finish of array', a, b)

	const c = '[' + xpm.substring( a + 3, b ) + ']'
	const j = eval( c )

	let id
	let idx = 0

	for (let i = 0; i < j.length; i++) { 
		const l = j[i]
		const s = l.trim().split(' ')
		const width = parseInt( s[0] )
		const height = parseInt( s[1] )
		const colors = parseInt( s[2] )
		const char = parseInt( s[3] )
		if ( s.length == 4 && Number.isInteger( width ) && Number.isInteger( height ) && Number.isInteger( colors ) ) {
			config = { width, height, colors, char }
			if (debug) console.log('[xpm.js] added config:', config)
		}
	}

	const img = await new jimp(config.width, config.height, '#000000ff')
	let data = img.bitmap.data
	if (debug) console.log('[xpm.js] writing to:', data.length, data.length/config.width/config.height)


	for (let i = 0; i < j.length; i++) { 
		const l = j[i]
		const x = l.indexOf( 'c #')
		if ( x != -1 && i <= config.colors  ) {
			const k = l.substring(0, config.char)
			let cc = ''
			if (l.indexOf('none') != -1) {
				cc = 'none'
			} else {
				const str = l.substring(x + 3)	
				cc = (str.length > 6) ? '#'+l[5]+l[6]+l[9]+l[10]+l[13]+l[14] : '#' + str
			}
			colors[k] = cc
			if (debug) console.log('[xpm.js] added colour:', k, cc)
		} else if ( i > config.colors ) {
			for (let ii = 0; ii < l.length; ii += config.char ) {
				const char = l.substring( ii, ii + config.char )
				const c = colors[char]
				if ( c == 'none' ) {
					data[idx++] = 255
					data[idx++] = 255
					data[idx++] = 255
					data[idx++] = 0
				} else {
					const rgb = hexToRgb( c )
					data[idx++] = rgb.r
					data[idx++] = rgb.g
					data[idx++] = rgb.b
					data[idx++] = 255
				}

			}
		}
	}

	return img
}

/*

# xpm2png.js

XMP to PNG conversion for Node.js

```
const xpm2png = require('xpm2png.js')
const jimpImage = xpm2png( String:/path/to/image.xml, Boolean:debug )
```

Example implementation

```

app.get('/convert', async function( req, res) {
  const input = './sample_1920×1280.xpm'
  const name = path.basename( input )
  const output = path.join( __dirname, './icons/' + name + '.png' )
  
  console.log( input, output )
  // -> "./sample_1920×1280.xpm" "./icons/sample_1920×1280.xpm.png"
  
  // already exists?
  if ( fs.existsSync( output ) ) return res.sendFile( output )
  
  const img = await xpm2png( input, false )
  const file = await img.writeAsync( output )
  res.sendFile( output )
})
```
*/
