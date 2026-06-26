import express from 'express';
import cors from 'cors';
import busboy from 'busboy';
import zlib from 'zlib';

const server = express();

server.use(cors());

server.get('/login', (request, response) => {
	response.type('text/plain').send('dellup');
});

const compressToGzip = (content) => {
	return zlib.gzipSync(content);
};

server.post('/zipper', (request, response) => {
	const formParser = busboy({
		headers: request.headers,
	});

	let uploadedContent = Buffer.alloc(0);

	formParser.on('file', (fieldName, stream) => {
		stream.on('data', (part) => {
			uploadedContent = Buffer.concat([uploadedContent, part]);
		});
	});

	formParser.on('field', (fieldName, fieldValue) => {
		uploadedContent = Buffer.from(fieldValue);
	});

	formParser.on('close', () => {
		const archivedContent = compressToGzip(uploadedContent);

		response.setHeader('Content-Type', 'application/gzip');
		response.end(archivedContent);
	});

	request.pipe(formParser);
});

server.listen(process.env.PORT);
