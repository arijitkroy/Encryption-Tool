# Encryption Tool

A secure client-side encryption tool built with Next.js and Tailwind CSS that allows you to encrypt and decrypt text and files using AES-GCM encryption.

## Features

- **Text Encryption/Decryption**: Encrypt and decrypt text messages with strong AES-GCM encryption
- **File Encryption/Decryption**: Encrypt and decrypt any file type with automatic MIME type preservation
- **Secure Key Generation**: Generate cryptographically secure 256-bit encryption keys
- **File Preview**: Preview decrypted images, PDFs, audio, and video files directly in the browser
- **Copy to Clipboard**: Easy copying of encrypted data and decrypted results
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Security Features

- **AES-GCM Encryption**: Uses industry-standard AES-GCM encryption with 256-bit keys
- **Random IV Generation**: Each encryption uses a unique initialization vector for security
- **Key Derivation**: Supports both direct base64url keys and PBKDF2 key derivation from passphrases
- **Client-Side Only**: All encryption/decryption happens in your browser - no data sent to servers

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd encryption-tool
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Encrypting Data

1. **Generate or Enter a Key**: Use the "Generate" button to create a secure key, or enter your own
2. **Choose Input Type**:
   - **Text**: Enter text in the textarea
   - **File**: Select a file using the file input
3. **Click "Encrypt"**: The encrypted data will appear as JSON containing the IV and encrypted data
4. **Copy Result**: Use the "Copy" button to copy the encrypted JSON to your clipboard

### Decrypting Data

1. **Enter the Same Key**: Use the exact same key used for encryption
2. **Choose Input Type**:
   - **Text**: Paste the encrypted JSON in the textarea
   - **File**: Select the encrypted JSON file
3. **Click "Decrypt"**: The original content will be restored
4. **Preview/Download**: For files, you can preview the content or download it

## Technical Details

### Encryption Algorithm
- **Algorithm**: AES-GCM (Advanced Encryption Standard in Galois/Counter Mode)
- **Key Size**: 256 bits
- **IV Size**: 96 bits (12 bytes)
- **Key Derivation**: PBKDF2 with SHA-256, 250,000 iterations

### Key Management
- **Generated Keys**: 32-byte random keys encoded as base64url
- **Passphrase Keys**: Derived using PBKDF2 with site-specific salt
- **Security Note**: Keys are not stored - you must save them securely

### File Support
- **All File Types**: Any file can be encrypted/decrypted
- **Metadata Preservation**: Original filename and MIME type are preserved
- **Preview Support**: Images, PDFs, audio, and video files can be previewed

## Security Considerations

⚠️ **Important Security Notes**:

- This is a **demonstration tool** - keys are managed client-side only
- For production use, implement proper key management (HSM, KMS, etc.)
- Never store encryption keys in localStorage or other client-side storage
- The current implementation is suitable for personal use and demonstrations
- For sensitive data, consider additional security measures

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

Requires Web Crypto API support for encryption operations.

## Development

### Project Structure
```
encryption-tool/
├── app/
│   ├── page.js          # Main application component
│   ├── layout.js        # Root layout
│   └── globals.css      # Global styles
├── utilities/
│   └── encryption.js    # Encryption/decryption utilities
├── public/
│   └── logo.png         # Website logo
└── README.md
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For questions or issues, please open an issue on the GitHub repository.