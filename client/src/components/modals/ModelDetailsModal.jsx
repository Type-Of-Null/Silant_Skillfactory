import ModalBase from "../ui/ModalBase";

const ModelDetailsModal = ({
  open,
  title,
  loading,
  error,
  data,
  editMode,
  canEdit,
  onClose,
  onStartEdit,
  onCancelEdit,
  onChangeName,
  onChangeDescription,
  onSave,
}) => {
  const footer = (
    <>
      {/* <div className="text-xs text-[#3d3d3d]">ID: {data?.id ?? "—"}</div> */}
      <div className="flex items-center flex-1 justify-end gap-2">
        {!editMode && (
          <button
            type="button"
            className="bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200"
            onClick={onClose}
          >
            Закрыть
          </button>
        )}
        {canEdit && !editMode && (
          <button
            type="button"
            className="bg-[#163E6C] px-3 py-1 text-sm font-semibold text-white hover:bg-[#1c4f8a]"
            onClick={onStartEdit}
          >
            Редактировать
          </button>
        )}
        {canEdit && editMode && (
          <>
            <button
              type="button"
              className="bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200"
              onClick={onCancelEdit}
            >
              Отмена
            </button>
            <button
              type="button"
              className="bg-green-600 px-3 py-1 text-sm font-semibold text-white hover:bg-green-700"
              onClick={onSave}
            >
              Сохранить
            </button>
          </>
        )}
      </div>
    </>
  );

  return (
    <ModalBase open={open} title={title} onClose={onClose} footer={footer}>
      {loading ? (
        <div className="py-6 text-center text-[#3d3d3d]">Загрузка...</div>
      ) : (
        <>
          {error && (
            <div className="mb-3 border-l-4 border-red-500 bg-red-50 p-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {!editMode ? (
            <div className="space-y-2">
              <div>
                <div className="text-xs text-[#3d3d3d]">Название</div>
                <div className="text-base font-medium">{data?.name}</div>
              </div>
              <div>
                <div className="text-xs text-[#3d3d3d]">Описание</div>
                <div className="text-sm whitespace-pre-wrap">
                  {data?.description || "—"}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-[#3d3d3d]">
                  Название
                </label>
                <input
                  type="text"
                  value={data?.name ?? ""}
                  onChange={(e) => onChangeName(e.target.value)}
                  className="w-full border border-gray-300 px-2 py-1"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#3d3d3d]">
                  Описание
                </label>
                <textarea
                  rows={4}
                  value={data?.description ?? ""}
                  onChange={(e) => onChangeDescription(e.target.value)}
                  className="w-full border border-gray-300 px-2 py-1"
                />
              </div>
            </div>
          )}
        </>
      )}
    </ModalBase>
  );
};

export default ModelDetailsModal;
