import React, { useEffect, useState } from 'react';
import { FaUpload, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import fetchStores from '../Utils/fetchStores';
import { useParams } from 'react-router-dom';

const ChecklistTable = ({
  items,
  rowStates,
  onCheckboxChange,
  onOpenFileDialog,
  bulkUploadMode,
}) => {
  const [filteredItems, setFilteredItems] = useState([]);
   const {selectedstore}=useParams();
  const storeAddress = selectedstore || '';
  console.log(storeAddress, 'stradd');

  useEffect(() => {
    const fetchAndFilter = async () => {
      if (!storeAddress) {
        console.log('No store address, showing all items');
        setFilteredItems(items);
        return;
      }

      try {
        const allStores = await fetchStores();
        console.log('Raw fetchStores response:', allStores);

        // Log store addresses for debugging
        const storeAddresses = allStores.map((store) => store.storeaddress);
        console.log('Available store addresses:', storeAddresses);

        // Get matching stores with case-insensitive and trimmed comparison
        const matchingStores = allStores.filter(
          (store) =>
            store.storeaddress?.trim().toUpperCase() === storeAddress.trim().toUpperCase()
        );
        console.log('Matching stores with details:', matchingStores);

        // Extract markets, checking for potential alternative keys
        const selectedMarkets = [
          ...new Set(
            matchingStores
              .flatMap((store) => [
                store.market?.toUpperCase(),
                store.Market?.toUpperCase(), // Check for case variation
                store.markets?.toUpperCase(), // Check for plural form
              ])
              .filter(Boolean)
          ),
        ];
        console.log('Selected markets from store:', selectedMarkets);

        if (matchingStores.length === 0) {
          console.warn('No matching stores found, showing all filtered items');
          setFilteredItems(items);
          return;
        }

        if (selectedMarkets.length === 0) {
          console.warn('No valid markets found, showing all filtered items');
          setFilteredItems(items);
          return;
        }

        // Filter items based on selectedMarkets
        const filtered = items.filter((item) => {
          let markets = item.selectedMarkets;

          if (typeof markets === 'string') {
            try {
              markets = JSON.parse(markets);
              console.log(`Parsed markets for "${item.question}":`, markets);
            } catch (e) {
              console.warn(`Failed to parse selectedMarkets for "${item.question}":`, e);
              markets = null;
            }
          }

          const normalizedMarkets = Array.isArray(markets)
            ? markets.map((m) => m?.toUpperCase())
            : [];

          const match =
            !markets ||
            normalizedMarkets.length === 0 ||
            normalizedMarkets.some((market) => selectedMarkets.includes(market));
          console.log(
            `Item "${item.question}" match result:`,
            match,
            'normalizedMarkets:',
            normalizedMarkets,
            'selectedMarkets:',
            selectedMarkets
          );
          return match;
        });

        console.log('Filtered items:', filtered);
        setFilteredItems(filtered);
      } catch (error) {
        console.error('Error fetching stores:', error);
        setFilteredItems(items);
      }
    };

    fetchAndFilter();
  }, [storeAddress, items]);

  return (
    <table className="table table-striped table-hover">
      <thead className="table-light">
        <tr>
          <th className="text-white" style={{ backgroundColor: '#E10174' }}>
            SINO
          </th>
          <th className="text-white" style={{ backgroundColor: '#E10174' }}>
            Question
          </th>
          {bulkUploadMode && (
            <th className="text-white" style={{ backgroundColor: '#E10174' }}>
              Status
            </th>
          )}
          <th className="text-white" style={{ backgroundColor: '#E10174' }}>
            Check
          </th>
          <th className="text-white" style={{ backgroundColor: '#E10174' }}>
            Files
          </th>
          <th className="text-white" style={{ backgroundColor: '#E10174' }}>
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {filteredItems.length > 0 ? (
          filteredItems.map((item, index) => {
            const state = rowStates[item.question] || {};
            return (
              <tr key={item.question || index}>
                <td>{index + 1}</td>
                <td>{item.question?.toLowerCase()}</td>

                {bulkUploadMode && (
                  <td>
                    {state.uploading ? (
                      <FaSpinner className="spinner-border spinner-border-sm text-primary" />
                    ) : state.uploaded ? (
                      <FaCheck className="text-success" />
                    ) : state.uploadError ? (
                      <FaTimes className="text-danger" />
                    ) : null}
                  </td>
                )}

                <td>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={state.checked || false}
                      onChange={onCheckboxChange(item.question)}
                      disabled={state.uploading}
                    />
                  </div>
                </td>

                <td>{state.fileNames?.join(', ') || 'No files'}</td>

                <td>
                  <button
                    className={`btn btn-sm ${
                      state.checked ? 'btn-primary' : 'btn-secondary'
                    }`}
                    onClick={() => onOpenFileDialog(item.question)}
                    disabled={!state.checked || state.uploading}
                  >
                    <FaUpload className="me-1" />
                    {state.fileNames?.length ? 'Change' : 'Add'}
                  </button>
                </td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan={bulkUploadMode ? 6 : 5} className="text-center">
            <div class="spinner-border p-3"></div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default ChecklistTable;