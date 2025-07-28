// components/ConfirmDialog.jsx
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const ConfirmDialog = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 space-y-4 animate-scaleIn">
        <div className="flex flex-col items-center text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-yellow-500 mb-2" />
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <p className="text-gray-600 mt-2">{message}</p>
        </div>
        <div className="flex justify-between gap-4 pt-2">
          <button
            onClick={onCancel}
            className="w-full py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
