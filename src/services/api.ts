import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { GoFile, FileListResponse, UploadParams } from '../types';

// Относительный URL — запросы идут через Vite proxy в dev-режиме
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// ─── RTK Query API ───────────────────────────────────────────────
export const filesApi = createApi({
  reducerPath: 'filesApi',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ['File', 'FileList'],

  endpoints: (builder) => ({
    // GET /files — список файлов
    getFiles: builder.query<FileListResponse, void>({
      query: () => '/files',
      providesTags: (result) =>
        result
          ? [
              ...result.files.map(({ id }) => ({
                type: 'File' as const,
                id,
              })),
              { type: 'FileList' },
            ]
          : [{ type: 'FileList' }],
    }),

    // GET /files/:id — метаданные файла
    getFile: builder.query<GoFile, string>({
      query: (id) => `/files/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'File', id }],
    }),

    // POST /files — загрузка файла (XHR для прогресса)
    uploadFile: builder.mutation<GoFile, UploadParams>({
      queryFn: ({ file, style, onProgress }) => {
        return new Promise((resolve) => {
          const xhr = new XMLHttpRequest();
          const formData = new FormData();
          formData.append('file', file);
          if (style) formData.append('style', style);

          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable && onProgress) {
              onProgress(Math.round((event.loaded / event.total) * 100));
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                resolve({ data: JSON.parse(xhr.responseText) });
              } catch {
                resolve({
                  error: {
                    status: xhr.status,
                    data: { message: 'Ошибка разбора ответа сервера' },
                  },
                });
              }
            } else {
              let message = `Ошибка сервера: ${xhr.statusText}`;
              try {
                const body = JSON.parse(xhr.responseText);
                if (body.detail) {
                  message = Array.isArray(body.detail)
                    ? body.detail.map((d: { msg: string }) => d.msg).join('; ')
                    : body.detail;
                }
              } catch {
                // ignore
              }
              resolve({ error: { status: xhr.status, data: { message } } });
            }
          });

          xhr.addEventListener('error', () => {
            resolve({
              error: {
                status: 0,
                data: { message: 'Не удалось подключиться к серверу' },
              },
            });
          });

          xhr.addEventListener('abort', () => {
            resolve({
              error: {
                status: 0,
                data: { message: 'Загрузка отменена' },
              },
            });
          });

          xhr.open('POST', `${BASE_URL}/files`);
          xhr.send(formData);
        });
      },
      invalidatesTags: [{ type: 'FileList' }],
    }),

    // DELETE /files/:id — удаление файла
    deleteFile: builder.mutation<void, string>({
      query: (id) => ({
        url: `/files/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'File', id },
        { type: 'FileList' },
      ],
    }),
  }),
});

// ─── Авто-сгенерированные хуки ──────────────────────────────────
export const {
  useGetFilesQuery,
  useGetFileQuery,
  useUploadFileMutation,
  useDeleteFileMutation,
} = filesApi;

// ─── URL-утилита ─────────────────────────────────────────────────
export function getViewUrl(id: string): string {
  return `${BASE_URL}/files/${id}/view`;
}
