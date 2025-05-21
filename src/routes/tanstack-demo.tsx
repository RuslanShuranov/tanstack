import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import * as React from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useForm } from '@tanstack/react-form';
import {postsQueryOptions, initialPostFormValues, type Post} from '~/utils/tanstack-demo';

export const Route = createFileRoute('/tanstack-demo')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(postsQueryOptions());
  },
  component: TanStackDemoComponent,
});

function TanStackDemoComponent() {
  const postsQuery = useSuspenseQuery(postsQueryOptions());
  const posts = postsQuery.data;

  const columnHelper = createColumnHelper<Post>();
  const columns = React.useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('title', {
        header: 'Title',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('body', {
        header: 'Content',
        cell: (info) => <div className="truncate max-w-md">{info.getValue()}</div>,
      }),
    ],
    [columnHelper]
  );

  const table = useReactTable({
    data: posts,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const { rows } = table.getRowModel();
  
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 50,
    overscan: 5,
  });

  const form = useForm({
    defaultValues: initialPostFormValues,
    onSubmit: async ({ value }) => {
      try {
        console.log('Form submitted:', value);
        alert('Post created successfully (simulated)');
        form.reset();
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    },
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">TanStack Demo Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* React Table with React Virtual */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Posts Table (React Table + React Virtual)</h2>
          <div 
            ref={tableContainerRef} 
            className="max-h-96 overflow-auto border border-gray-200 rounded"
          >
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th 
                        key={header.id}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rowVirtualizer.getVirtualItems().map(virtualRow => {
                  const row = rows[virtualRow.index];
                  return (
                    <tr key={row.id}>
                      {row.getVisibleCells().map(cell => (
                        <td 
                          key={cell.id}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* React Form */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Create Post Form (React Form)</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                value={form.state.values.title}
                onChange={e => form.setFieldValue('title', e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="body" className="block text-sm font-medium text-gray-700">
                Content
              </label>
              <textarea
                id="body"
                name="body"
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                value={form.state.values.body}
                onChange={e => form.setFieldValue('body', e.target.value)}
              />
                {form.state.fieldMeta.body?.errors.length && (
                    <p className="mt-1 text-sm text-red-600">{form.state.fieldMeta.body.errors.join(', ')}</p>
                )}
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create Post
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
