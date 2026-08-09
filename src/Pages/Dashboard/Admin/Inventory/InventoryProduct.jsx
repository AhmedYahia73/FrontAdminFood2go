import React, { useEffect, useState, useMemo } from "react";
import Select from "react-select";
import { TitlePage, StaticLoader } from "../../../../Components/Components";
import { useGet } from "../../../../Hooks/useGet";
import { usePost } from "../../../../Hooks/usePostJson";
import { useChangeState } from "../../../../Hooks/useChangeState";
import { useAuth } from "../../../../Context/Auth";
import {
    FiPackage,
    FiClock,
    FiFileText,
    FiFile,
    FiDownload,
    FiPlus,
    FiX,
    FiCheck,
    FiAlertCircle,
    FiEdit,
    FiCheckCircle,
    FiUpload,
    FiSave,
    FiArrowLeft
} from "react-icons/fi";

// Export Libraries
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import { useTranslation } from "react-i18next";

const InventoryProduct = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const auth = useAuth();
    // API Hooks
    const { data: listsData, loading: loadingLists } = useGet({
        url: `${apiUrl}/admin/inventory/product/lists`,
    });
   const { t, i18n } = useTranslation();
             const direction = i18n.language === 'ar' ? 'rtl' : 'ltr';
    const {
        postData: loadStocks,
        loading: loadingStocks,
        response: rawStocksData,
    } = usePost({
        url: `${apiUrl}/admin/inventory/product`,
    });

    const { postData: modifyQuantity } = usePost({
        url: `${apiUrl}/admin/inventory/product/modify_stocks`,
    });
    const { postData: modifyActual } = usePost({
        url: `${apiUrl}/admin/inventory/product/modify_actual`,
    });

    // NEW: API for creating inventory
    const {
        postData: createInventory,
        loading: creatingInventory,
        response: createInventoryResponse
    } = usePost({
        url: `${apiUrl}/admin/inventory/product/create_inventory`,
    });

    // NEW: API for current inventory list
    const {
        data: currentData,
        loading: loadingCurrent,
        refetch: refetchCurrent
    } = useGet({
        url: `${apiUrl}/admin/inventory/product/current`,
    });

    // NEW: API for history inventory list
    const {
        data: historyData,
        loading: loadingHistory,
        refetch: refetchHistory
    } = useGet({
        url: `${apiUrl}/admin/inventory/product/history`,
    });

    // NEW: Current Inventory States
    const [finalizingInventory, setFinalizingInventory] = useState(null);
    const [editingInventoryId, setEditingInventoryId] = useState(null);
    const [inventoryProducts, setInventoryProducts] = useState([]);
    const [editedQuantities, setEditedQuantities] = useState({});

    // NEW: API for opening inventory details
    const {
        data: openInventoryData,
        loading: loadingOpenInventory,
        refetch: refetchOpenInventory
    } = useGet({
        url: editingInventoryId ? `${apiUrl}/admin/inventory/product/open_inventory/${editingInventoryId}` : null,
    });

    // NEW: API for modifying products
    const {
        postData: modifyProducts,
        loading: loadingModifyProducts,
        response: modifyProductsResponse
    } = usePost({
        url: editingInventoryId ? `${apiUrl}/admin/inventory/product/modify_products/${editingInventoryId}` : null,
    });

    // NEW: API for inability list
    const {
        data: inabilityListData,
        loading: loadingInabilityList,
        refetch: refetchInabilityList
    } = useGet({
        url: editingInventoryId && finalizingInventory ? `${apiUrl}/admin/inventory/product/inability_list/${editingInventoryId}` : null,
    });

    // NEW: API for updating shortages
    const {
        postData: updateShortages,
        loading: loadingUpdateShortages
    } = usePost({
        url: `${apiUrl}/admin/inventory/product/wested`,
    });

    //Change inventory state
    const { changeState: changeInventoryState, loading: loadingChangeInventoryState } = useChangeState();

    // Tab State
    const [activeTab, setActiveTab] = useState("current"); // "current", "history"

    // Filter States
    const [selectedStore, setSelectedStore] = useState(null);
    const [filterType, setFilterType] = useState(null); // full | partial
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);

    // NEW: Create Inventory Modal States
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createStore, setCreateStore] = useState(null);
    const [createType, setCreateType] = useState(null);
    const [createCategories, setCreateCategories] = useState([]);
    const [createProducts, setCreateProducts] = useState([]);

    // Table States
    const [stocks, setStocks] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [editQuantityMode, setEditQuantityMode] = useState(false);
    const [editActualMode, setEditActualMode] = useState(false);

    // NEW: Report and Adjustment States
    const [showReport, setShowReport] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [showAdjustment, setShowAdjustment] = useState(false);
    const [shortageList, setShortageList] = useState([]);
    const [editedShortages, setEditedShortages] = useState({});
    const [shortageReasons, setShortageReasons] = useState({});

    // NEW: Selection states for shortages
    const [selectedShortages, setSelectedShortages] = useState([]);
    const [adjustmentReason, setAdjustmentReason] = useState("");

    // Options
    const storeOptions = useMemo(
        () => (listsData?.stores || []).map((s) => ({ value: s.id, label: s.name })),
        [listsData?.stores]
    );

    const allCategoriesOption = { value: "__ALL_CATEGORIES__", label: t("All Categories") };
    const categoryOptions = useMemo(
        () => [
            allCategoriesOption,
            ...(listsData?.categories || []).map((c) => ({
                value: c.id,
                label: c.name,
            })),
        ],
        [listsData?.categories]
    );

    const typeOptions = [
        { value: "full", label: t("Full") },
        { value: "partial", label: t("Partial") },
    ];

    // Available products based on selected categories for main filter
    const availableProducts = useMemo(() => {
        if (selectedCategories.length === 0) return [];

        const categoryIds = selectedCategories
            .map((c) => c.value)
            .filter((v) => v !== "__ALL_CATEGORIES__");

        if (categoryIds.length === 0) return [];

        return (listsData?.products || [])
            .filter((p) => categoryIds.includes(p.category_id) ||
                categoryIds.map(String).includes(String(p.category_id)))
            .map((p) => ({ value: p.id, label: p.name }));
    }, [listsData?.products, selectedCategories]);

    const allProductsOption = { value: "__ALL_PRODUCTS__", label: t("All Products") };
    const productOptions = [allProductsOption, ...availableProducts];

    // NEW: Available products for create modal
    const createAvailableProducts = useMemo(() => {
        if (createCategories.length === 0) return [];

        const categoryIds = createCategories
            .map((c) => c.value)
            .filter((v) => v !== "__ALL_CATEGORIES__");

        if (categoryIds.length === 0) return [];

        return (listsData?.products || [])
            .filter((p) => categoryIds.includes(p.category_id))
            .map((p) => ({ value: p.id, label: p.name }));
    }, [listsData?.products, createCategories]);

    const createProductOptions = [allProductsOption, ...createAvailableProducts];

    // Current and History Data
    const currentInventories = useMemo(() =>
        currentData?.inventory_list || [],
        [currentData]
    );

    const historyInventories = useMemo(() =>
        historyData?.inventory_list || [],
        [historyData]
    );

    // NEW: Handle opening inventory for editing
    const handleOpenInventory = (inventoryId) => {
        setEditingInventoryId(inventoryId);
    };

    // NEW: Load inventory products when data is fetched
    useEffect(() => {
        if (openInventoryData?.products) {
            setInventoryProducts(openInventoryData.products.map((product, index) => ({
                ...product,
                id: index, // Create a temporary ID for editing
                originalQuantity: product.quantity,
                editedQuantity: product.quantity
            })));

            // Initialize edited quantities
            const initialQuantities = {};
            openInventoryData.products.forEach((product, index) => {
                initialQuantities[index] = product.quantity;
            });
            setEditedQuantities(initialQuantities);
        }
    }, [openInventoryData]);

    // NEW: Handle quantity change in inventory editing
    const handleInventoryQuantityChange = (index, value) => {
        setEditedQuantities(prev => ({
            ...prev,
            [index]: value
        }));

        // Update the inventoryProducts array
        setInventoryProducts(prev => prev.map((product, i) =>
            i === index ? { ...product, editedQuantity: value } : product
        ));
    };

    useEffect(() => {
        if (modifyProductsResponse && modifyProductsResponse.status === 200 && modifyProductsResponse?.data?.report) {
            setReportData(modifyProductsResponse);
            setShowReport(true);
            auth.toastSuccess(t("Quantities updated successfully"));
        }
    }, [modifyProductsResponse]);

    // NEW: Handle submit edited quantities
    const handleSubmitEditedQuantities = async () => {
        if (!editingInventoryId) return;

        // Prepare payload
        const payload = {};

        inventoryProducts.forEach((product, index) => {
            payload[`products[${index}][id]`] = product.product_id;
            payload[`products[${index}][quantity]`] = editedQuantities[index];
        });

        // Set URL for modifying products
        await modifyProducts(payload);
    };

    // NEW: Handle Edit Quantity button click
    const handleEditQuantity = () => {
        setShowReport(false);
        setReportData(null);
        // Keep the editing mode active
    };

    // NEW: Handle Adjustment button click
    const handleAdjustment = () => {
        setShowReport(false);
        setShowAdjustment(true);
    };

    // NEW: Load shortage list when data is fetched
    useEffect(() => {
        if (inabilityListData?.shourtage_list) {
            setShortageList(inabilityListData.shourtage_list);

            // Initialize selected shortages
            setSelectedShortages([]);
            setAdjustmentReason("");

            // Initialize edited shortages and reasons
            const initialShortages = {};
            const initialReasons = {};
            inabilityListData.shourtage_list.forEach((item, index) => {
                initialShortages[index] = item.inability || 0;
                initialReasons[index] = item.reason || "";
            });
            setEditedShortages(initialShortages);
            setShortageReasons(initialReasons);
        }
    }, [inabilityListData]);

    // NEW: Handle shortage selection
    const toggleShortageSelection = (index) => {
        setSelectedShortages(prev => {
            if (prev.includes(index)) {
                return prev.filter(i => i !== index);
            } else {
                return [...prev, index];
            }
        });
    };

    // NEW: Select all shortages
    const selectAllShortages = () => {
        if (selectedShortages.length === shortageList.length) {
            setSelectedShortages([]);
        } else {
            setSelectedShortages(shortageList.map((_, index) => index));
        }
    };

    // NEW: Handle submit selected shortages to wasted API
    const handleSubmitSelectedShortages = async () => {
        if (!editingInventoryId) return;

        if (selectedShortages.length === 0) {
            return auth.toastError(t("Please select at least one shortage"));
        }

        if (!adjustmentReason.trim()) {
            return auth.toastError(t("Please enter a reason"));
        }

        // Find the current inventory to get store_id
        const currentInventory = currentInventories.find(inv => inv.id === editingInventoryId);

        if (!currentInventory) {
            return auth.toastError(t("Inventory not found"));
        }

        // Prepare payload - use store_id from current inventory
        const payload = {
            store_id: currentInventory.store_id, // This should be the store ID from the current table
            reason: adjustmentReason
        };

        // Add selected shortages to payload
        selectedShortages.forEach((shortageIndex, arrayIndex) => {
            if (shortageList[shortageIndex]) {
                payload[`inabilities[${arrayIndex}]`] = shortageList[shortageIndex].id;
            }
        });

        const success = await updateShortages(payload);
        if (success) {
            auth.toastSuccess(t("Shortages submitted successfully"));
            // Go back to current table
            handleBackToCurrent();
        }
    };

    // NEW: Handle back from adjustment
    const handleBackFromAdjustment = () => {
        setShowAdjustment(false);
        setShortageList([]);
        setEditedShortages({});
        setShortageReasons({});
        setSelectedShortages([]);
        setAdjustmentReason("");
    };

    // NEW: Handle back to current table
    const handleBackToCurrent = () => {
        setEditingInventoryId(null);
        setInventoryProducts([]);
        setEditedQuantities({});
        setShowReport(false);
        setReportData(null);
        setShowAdjustment(false);
        setShortageList([]);
        setEditedShortages({});
        setShortageReasons({});
        setSelectedShortages([]);
        setAdjustmentReason("");
        // Refresh current data
        refetchCurrent();
    };

    // NEW: Handle Create Inventory with stock check
    useEffect(() => {
        if (createInventoryResponse) {
            if (createInventoryResponse.status === 200 || createInventoryResponse.success) {
                // Check if stocks array exists and is empty
                if (createInventoryResponse.data?.stocks &&
                    Array.isArray(createInventoryResponse.data.stocks) &&
                    createInventoryResponse.data.stocks.length === 0) {
                    // Stocks array is empty
                    auth.toastError(t("The stock is empty"));
                } else {
                    // Inventory created successfully with stocks
                    auth.toastSuccess(createInventoryResponse.message || t("Inventory created successfully"));
                }
                setShowCreateModal(false);
                resetCreateModal();
                // Refresh current inventories after creation
                refetchCurrent();
            }
        }
    }, [createInventoryResponse, auth, refetchCurrent]);

    // NEW: Handle finalize inventory
    const handleFinalizeInventory = (inventoryId) => {
        setFinalizingInventory(inventoryId);
    };

    // NEW: Handle remove finalize
    const handleRemoveFinalize = () => {
        setFinalizingInventory(null);
    };

    // NEW: Handle direct adjustment from current table
    const handleDirectAdjustment = (inventoryId) => {
        setEditingInventoryId(inventoryId);
        setShowAdjustment(true);
    };

    // Reset on type change
    useEffect(() => {
        setSelectedCategories([]);
        setSelectedProducts([]);
    }, [filterType]);

    // NEW: Reset create modal on type change
    useEffect(() => {
        if (createType?.value === "partial") {
            setCreateCategories([]);
            setCreateProducts([]);
        }
    }, [createType]);

    // Handle "All Categories" click for main filter
    const handleCategoryChange = (selected) => {
        if (selected?.some((opt) => opt.value === "__ALL_CATEGORIES__")) {
            const allCats = (listsData?.categories || []).map((c) => ({
                value: c.id,
                label: c.name,
            }));
            setSelectedCategories(allCats);
        } else {
            setSelectedCategories(selected || []);
        }
    };

    // Handle "All Products" click for main filter
    const handleProductChange = (selected) => {
        if (selected?.some((opt) => opt.value === "__ALL_PRODUCTS__")) {
            setSelectedProducts(availableProducts);
        } else {
            setSelectedProducts(selected?.filter((opt) => opt.value !== "__ALL_PRODUCTS__") || []);
        }
    };

    // NEW: Handle "All Categories" click for create modal
    const handleCreateCategoryChange = (selected) => {
        if (selected?.some((opt) => opt.value === "__ALL_CATEGORIES__")) {
            const allCats = (listsData?.categories || []).map((c) => ({
                value: c.id,
                label: c.name,
            }));
            setCreateCategories(allCats);
        } else {
            setCreateCategories(selected || []);
        }
    };

    // NEW: Handle "All Products" click for create modal
    const handleCreateProductChange = (selected) => {
        if (selected?.some((opt) => opt.value === "__ALL_PRODUCTS__")) {
            setCreateProducts(createAvailableProducts);
        } else {
            setCreateProducts(selected?.filter((opt) => opt.value !== "__ALL_PRODUCTS__") || []);
        }
    };

    // Load stocks from response
    useEffect(() => {
        const data = rawStocksData?.data?.stocks || rawStocksData?.stocks;
        if (data && Array.isArray(data)) {
            setStocks(
                data.map((item) => ({
                    ...item,
                    isEdited: false,
                    quantity: item.quantity ?? 0,
                    actual_quantity: item.actual_quantity ?? 0,
                    inability: item.inability ?? null,
                }))
            );
        }
    }, [rawStocksData]);

    // NEW: Handle Create Inventory
    const handleCreateInventory = async () => {
        if (!createStore) return auth.toastError(t("Please select a store"));
        if (!createType) return auth.toastError(t("Please select type"));

        const payload = {
            store_id: createStore.value,
            type: createType.value
        };

        if (createType.value === "partial") {
            if (createCategories.length === 0) {
                return auth.toastError(t("Please select at least one category"));
            }

            // Get all selected category IDs (excluding "All Categories" option)
            const categoryIds = createCategories
                .filter(cat => cat.value !== "__ALL_CATEGORIES__")
                .map(cat => cat.value);

            // Get all selected product IDs (excluding "All Products" option)
            const productIds = createProducts
                .filter(prod => prod.value !== "__ALL_PRODUCTS__")
                .map(prod => prod.value);

            // Send all categories and products
            payload.categories = categoryIds;
            payload.products = productIds;
        }

        await createInventory(payload);
        // The toast messages will be handled by the useEffect above
    };

    // NEW: Reset create modal
    const resetCreateModal = () => {
        setCreateStore(null);
        setCreateType(null);
        setCreateCategories([]);
        setCreateProducts([]);
    };

    // Apply Filter
    const handleFilterSubmit = async () => {
        if (!selectedStore) return auth.toastError(t("Please select a store"));
        if (!filterType) return auth.toastError(t("Please select filter type"));

        if (filterType.value === "partial" && selectedCategories.length === 0) {
            return auth.toastError(t("Please select at least one category"));
        }

        const payload = { store_id: selectedStore.value, type: filterType.value };

        if (filterType.value === "full") {
            payload.type = "full";
        } else {
            // Partial: get product IDs
            let productIds = [];

            if (selectedProducts.length > 0) {
                productIds = selectedProducts.map((p) => p.value);
            } else {
                // No specific products → send all from selected categories
                productIds = availableProducts.map((p) => p.value);
            }

            productIds.forEach((id, i) => {
                payload[`products[${i}]`] = id;
            });
        }

        await loadStocks(payload);
        setSelectedRows([]);
        setEditQuantityMode(false);
        setEditActualMode(false);
    };

    // Table row selection
    const toggleRow = (id) => {
        setSelectedRows((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        setSelectedRows(
            selectedRows.length === stocks.length ? [] : stocks.map((s) => s.id)
        );
    };

    const handleInputChange = (id, field, value) => {
        setStocks((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, [field]: value, isEdited: true } : item
            )
        );
    };

    const saveQuantity = async () => {
        const changed = stocks.filter((s) => selectedRows.includes(s.id) && s.isEdited);
        if (changed.length === 0) return auth.toastError(t("No changes"));

        const formData = new FormData();
        changed.forEach((item, i) => {
            formData.append(`stocks[${i}][id]`, item.id);
            formData.append(`stocks[${i}][quantity]`, item.quantity);
        });

        const success = await modifyQuantity(formData);
        if (success) {
            auth.toastSuccess(t("Quantity updated"));
            setEditQuantityMode(false);
            setSelectedRows([]);
        }
    };

    const saveActualQuantity = async () => {
        const changed = stocks.filter((s) => selectedRows.includes(s.id) && s.isEdited);
        if (changed.length === 0) return auth.toastError(t("No changes"));

        const formData = new FormData();
        changed.forEach((item, i) => {
            formData.append(`stocks[${i}][id]`, item.id);
            formData.append(`stocks[${i}][actual_quantity]`, item.actual_quantity);
        });

        const success = await modifyActual(formData);
        if (success) {
            auth.toastSuccess(t("Actual quantity updated"));
            setEditActualMode(false);
            setSelectedRows([]);
        }
    };

    // Export Functions for Count Stock tab
    const getExportData = () =>
        selectedRows.length === 0
            ? stocks
            : stocks.filter((s) => selectedRows.includes(s.id));

    const exportPDF = () => {
        const data = getExportData();
        const doc = new jsPDF("p", "mm", "a4");
        doc.setFontSize(18);
        doc.text("Inventory Products Report", 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Store: ${selectedStore?.label || "—"}`, 14, 30);
        doc.text(`Exported: ${data.length} items`, 14, 37);

        autoTable(doc, {
            head: [["Product", "Category", "Unit", "Quantity", "Actual Qty", "Shortage"]],
            body: data.map((s) => [
                s.product || "—",
                s.category || "—",
                s.unit || "—",
                s.quantity,
                s.actual_quantity,
                s.inability ?? "—",
            ]),
            startY: 45,
            theme: "grid",
            headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        });

        doc.save(`inventory_${selectedStore?.label || "all"}_${new Date().toISOString().split("T")[0]}.pdf`);
    };

    const exportExcel = () => {
        const data = getExportData();
        const ws = XLSX.utils.json_to_sheet(
            data.map((s) => ({
                Product: s.product || "—",
                Category: s.category || "—",
                Unit: s.unit || "—",
                Quantity: s.quantity,
                "Actual Qty": s.actual_quantity,
                Shortage: s.inability ?? "—",
            }))
        );
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Products");
        XLSX.writeFile(wb, `inventory_${selectedStore?.label || "all"}_${new Date().toISOString().split("T")[0]}.xlsx`);
    };

    const exportCSV = () => {
        const data = getExportData();
        const csv = Papa.unparse(
            data.map((s) => ({
                Product: s.product || "—",
                Category: s.category || "—",
                Unit: s.unit || "—",
                Quantity: s.quantity,
                "Actual Qty": s.actual_quantity,
                Shortage: s.inability ?? "—",
            }))
        );
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, `inventory_${selectedStore?.label || "all"}_${new Date().toISOString().split("T")[0]}.csv`);
    };

    // Format date function
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Check if any quantities have been changed
    const hasQuantityChanges = useMemo(() => {
        return inventoryProducts.some((product, index) =>
            editedQuantities[index] !== product.originalQuantity
        );
    }, [inventoryProducts, editedQuantities]);

    // NEW: Export report functions - updated to use modifyProductsResponse
    const exportReportPDF = () => {
        if (!modifyProductsResponse?.data?.report) return;

        const report = modifyProductsResponse.data.report;
        const storeName = modifyProductsResponse.data.store_name || "Unknown Store";

        const doc = new jsPDF();

        // Title
        doc.setFontSize(16);
        doc.text(`Inventory Report #${editingInventoryId}`, 14, 20);
        doc.setFontSize(12);
        doc.text(`Store: ${storeName}`, 14, 30);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 40);

        // Summary stats
        const totalProducts = report.length;
        const totalQuantity = report.reduce((sum, item) => sum + (item.quantity || 0), 0);
        const totalActualQty = report.reduce((sum, item) => sum + (item.actual_quantity || 0), 0);
        const totalShortage = report.reduce((sum, item) => sum + (item.inability || 0), 0);

        doc.text(`Total Products: ${totalProducts}`, 14, 55);
        doc.text(`Total Quantity: ${totalQuantity}`, 14, 65);
        doc.text(`Total Actual Quantity: ${totalActualQty}`, 14, 75);
        doc.text(`Total Shortage: ${totalShortage}`, 14, 85);

        // Table headers
        const headers = [["#", "Product", "Category", "Qty", "Actual Qty", "Shortage", "Cost"]];

        // Table data
        const data = report.map((item, index) => [
            index + 1,
            item.product || "—",
            item.category || "—",
            item.quantity || 0,
            item.actual_quantity || 0,
            item.inability || 0,
            `${item.cost || 0} EGP`
        ]);

        // Add table
        autoTable(doc, {
            head: headers,
            body: data,
            startY: 95,
            theme: "grid",
            headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        });

        doc.save(`inventory_report_${editingInventoryId}_${new Date().toISOString().split("T")[0]}.pdf`);
    };

    const exportReportCSV = () => {
        if (!modifyProductsResponse?.data?.report) return;

        const report = modifyProductsResponse.data.report;
        const storeName = modifyProductsResponse.data.store_name || "Unknown Store";

        // Summary data
        const totalProducts = report.length;
        const totalQuantity = report.reduce((sum, item) => sum + (item.quantity || 0), 0);
        const totalActualQty = report.reduce((sum, item) => sum + (item.actual_quantity || 0), 0);
        const totalShortage = report.reduce((sum, item) => sum + (item.inability || 0), 0);

        // Create CSV data
        const csvData = [
            ["Inventory Report", `#${editingInventoryId}`],
            ["Store", storeName],
            ["Generated", new Date().toLocaleDateString()],
            [],
            ["Summary"],
            ["Total Products", totalProducts],
            ["Total Quantity", totalQuantity],
            ["Total Actual Quantity", totalActualQty],
            ["Total Shortage", totalShortage],
            [],
            ["Detailed Products"],
            ["#s", "Product", "Category", "Quantity", "Actual Quantity", "Shortage", "Cost", "Date"]
        ];

        // Add product details
        report.forEach((item, index) => {
            csvData.push([
                index + 1,
                item.product || "",
                item.category || "",
                item.quantity || 0,
                item.actual_quantity || 0,
                item.inability || 0,
                item.cost || 0,
                item.date ? new Date(item.date).toLocaleDateString() : ""
            ]);
        });

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, `inventory_report_${editingInventoryId}_${new Date().toISOString().split("T")[0]}.csv`);
    };

    //Change inventory state
    const handleChangeStatus = async (id, name, favourite) => {
        const response = await changeInventoryState(
            `${apiUrl}/admin/inventory/product/update_inventory_status/${id}`,
            `${name} Changed Status.`,
        );

        if (response) {
            refetchCurrent();
            refetchHistory();
        }
    };

    return (
        <div className="w-full p-6 pb-20">
            <TitlePage text={t("Inventory Products")} />

            {/* NEW: Create Inventory Button */}
            <div className="flex justify-end mb-6">
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-3 px-6 py-3 font-semibold text-white transition bg-green-600 rounded-xl hover:bg-green-700"
                >
                    <FiPlus size={20} />
                    {t("Create Inventory")}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-8 mb-10 border-b-2 border-gray-200">
                <button
                    onClick={() => setActiveTab("current")}
                    className={`flex items-center gap-3 pb-4 text-lg font-semibold ${activeTab === "current" ? "text-mainColor border-b-4 border-mainColor" : "text-gray-500"}`}
                >
                    <FiClock size={22} /> {t("Current")}
                </button>
                <button
                    onClick={() => setActiveTab("history")}
                    className={`flex items-center gap-3 pb-4 text-lg font-semibold ${activeTab === "history" ? "text-mainColor border-b-4 border-mainColor" : "text-gray-500"}`}
                >
                    <FiClock size={22} /> {t("History")}
                </button>
            </div>

            {/* NEW: Create Inventory Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        {/* Modal Header - Fixed */}
                        <div className="flex items-center justify-between p-6 border-b shrink-0">
                            <h2 className="text-2xl font-bold text-gray-800">
                                {t("Create New Inventory")}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    resetCreateModal();
                                }}
                                className="p-2 transition rounded-full hover:bg-gray-100"
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        {/* Modal Content - Scrollable */}
                        <div className="flex-1 p-6 overflow-y-auto">
                            <div className="space-y-6">
                                {/* Store */}
                                <div>
                                    <label className="block mb-3 text-lg font-medium text-gray-700">
                                        {t("Store")} *
                                    </label>
                                    <Select
                                        value={createStore}
                                        onChange={setCreateStore}
                                        options={storeOptions}
                                        placeholder={t("Select store")}
                                        isLoading={loadingLists}
                                        isClearable
                                        menuPortalTarget={document.body}
                                        styles={{
                                            menuPortal: base => ({ ...base, zIndex: 9999 }),
                                            menu: base => ({ ...base, zIndex: 9999 }),
                                            menuList: base => ({
                                                ...base,
                                                maxHeight: '200px',
                                                overflowY: 'auto'
                                            })
                                        }}
                                    />
                                </div>

                                {/* Type */}
                                <div>
                                    <label className="block mb-3 text-lg font-medium text-gray-700">
                                        {t("Type")} *
                                    </label>
                                    <Select
                                        value={createType}
                                        onChange={setCreateType}
                                        options={typeOptions}
                                        placeholder={t("Full or Partial")}
                                        isClearable={false}
                                        menuPortalTarget={document.body}
                                        styles={{
                                            menuPortal: base => ({ ...base, zIndex: 9999 }),
                                            menu: base => ({ ...base, zIndex: 9999 }),
                                            menuList: base => ({
                                                ...base,
                                                maxHeight: '200px',
                                                overflowY: 'auto'
                                            })
                                        }}
                                    />
                                </div>

                                {/* Categories - Only in Partial */}
                                {createType?.value === "partial" && (
                                    <>
                                        <div>
                                            <label className="block mb-3 text-lg font-medium text-gray-700">
                                                {t("Categories")} *
                                            </label>
                                            <Select
                                                isMulti
                                                value={createCategories}
                                                onChange={handleCreateCategoryChange}
                                                options={categoryOptions}
                                                placeholder={t("Click 'All Categories' or select manually")}
                                                closeMenuOnSelect={false}
                                                hideSelectedOptions={false}
                                                menuPortalTarget={document.body}
                                                styles={{
                                                    menuPortal: base => ({ ...base, zIndex: 9999 }),
                                                    menu: base => ({ ...base, zIndex: 9999 }),
                                                    menuList: base => ({
                                                        ...base,
                                                        maxHeight: '200px',
                                                        overflowY: 'auto'
                                                    }),
                                                    multiValue: (base, { data }) => {
                                                        if (data.value === "__ALL_CATEGORIES__") {
                                                            return { ...base, backgroundColor: "#3b82f6", color: "white" };
                                                        }
                                                        return base;
                                                    },
                                                }}
                                            />
                                            {createCategories.length > 0 && (
                                                <p className="mt-2 text-sm text-gray-600">
                                                    {createCategories.length === (listsData?.categories?.length || 0)
                                                        ? t("All categories selected")
                                                        : `${createCategories.length} ${t("categories selected")}`}
                                                </p>
                                            )}
                                        </div>

                                        {/* Products - Optional + All Products */}
                                        <div>
                                            <label className="block mb-3 text-lg font-medium text-gray-700">
                                                {t("Products")} ({t("Optional")})
                                            </label>
                                            <Select
                                                isMulti
                                                value={createProducts}
                                                onChange={handleCreateProductChange}
                                                options={createProductOptions}
                                                placeholder={
                                                    createAvailableProducts.length === 0
                                                        ? t("Select categories first")
                                                        : t("Click 'All Products' or select specific")
                                                }
                                                closeMenuOnSelect={false}
                                                isDisabled={createAvailableProducts.length === 0}
                                                hideSelectedOptions={false}
                                                menuPortalTarget={document.body}
                                                styles={{
                                                    menuPortal: base => ({ ...base, zIndex: 9999 }),
                                                    menu: base => ({ ...base, zIndex: 9999 }),
                                                    menuList: base => ({
                                                        ...base,
                                                        maxHeight: '200px',
                                                        overflowY: 'auto'
                                                    }),
                                                    multiValue: (base, { data }) => {
                                                        if (data.value === "__ALL_PRODUCTS__") {
                                                            return { ...base, backgroundColor: "#10b981", color: "white" };
                                                        }
                                                        return base;
                                                    },
                                                }}
                                            />
                                            {createProducts.length > 0 ? (
                                                <p className="mt-2 text-sm text-green-600">
                                                    {createProducts.length === createAvailableProducts.length
                                                        ? t("All products selected")
                                                        : `${createProducts.length} ${t("products selected")}`}
                                                </p>
                                            ) : createCategories.length > 0 ? (
                                                <p className="mt-2 text-sm text-gray-500">
                                                    {createAvailableProducts.length} {t("products available")}
                                                </p>
                                            ) : null}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer - Fixed */}
                        <div className="flex justify-end gap-4 p-6 border-t shrink-0">
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    resetCreateModal();
                                }}
                                className="px-6 py-3 font-medium text-gray-700 transition border border-gray-300 rounded-xl hover:bg-gray-50"
                            >
                                {t("Cancel")}
                            </button>
                            <button
                                onClick={handleCreateInventory}
                                disabled={creatingInventory || !createStore || !createType || (createType?.value === "partial" && createCategories.length === 0)}
                                className="flex items-center gap-3 px-8 py-3 font-semibold text-white transition bg-green-600 rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {creatingInventory && <StaticLoader size={20} />}
                                {t("Create Inventory")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Render content based on active tab */}
            {activeTab === "current" ? (
                /* Current Inventories Tab */
                editingInventoryId ? (
                    /* Edit Inventory View */
                    showAdjustment ? (
                        /* Shortage Adjustment View */
                        <div>
                            {/* Back Button */}
                            <div className="mb-6">
                                <button
                                    onClick={handleBackFromAdjustment}
                                    className="flex items-center gap-2 px-4 py-2 text-gray-600 transition hover:text-gray-800"
                                >
                                    <FiArrowLeft size={20} />
                                    {t("Back to Report")}
                                </button>
                            </div>

                            {/* Adjustment Header */}
                            <div className="p-6 mb-6 bg-white shadow-md rounded-2xl">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        {t("Shortage Adjustment")} #{editingInventoryId}
                                    </h2>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={handleSubmitSelectedShortages}
                                            disabled={loadingUpdateShortages || selectedShortages.length === 0 || !adjustmentReason.trim()}
                                            className="flex items-center gap-2 px-6 py-2 font-medium text-white transition bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <FiSave size={18} />
                                            {loadingUpdateShortages ? t("Saving...") : t("Submit Selected Shortages")}
                                        </button>
                                    </div>
                                </div>

                                {/* Adjustment Reason Input */}
                                <div className="mt-4">
                                    <label className="block mb-3 text-lg font-medium text-gray-700">
                                        {t("Adjustment Reason")} *
                                    </label>
                                    <textarea
                                        value={adjustmentReason}
                                        onChange={(e) => setAdjustmentReason(e.target.value)}
                                        placeholder={t("Enter reason for shortage adjustment...")}
                                        className="w-full px-4 py-3 font-medium transition border border-gray-300 rounded-lg resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        rows="3"
                                    />
                                    <p className="mt-2 text-sm text-gray-500">
                                        {t("Please select shortages below and enter a reason before submitting.")}
                                    </p>
                                </div>

                                {/* Selected Count */}
                                {selectedShortages.length > 0 && (
                                    <div className="p-3 mt-4 rounded-lg bg-blue-50">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-blue-700">
                                                {selectedShortages.length} {t("shortages selected")}
                                            </span>
                                            <button
                                                onClick={selectAllShortages}
                                                className="text-sm text-blue-600 hover:text-blue-800"
                                            >
                                                {selectedShortages.length === shortageList.length ? t("Deselect All") : t("Select All")}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>


                            {/* Shortage List Table */}
                            {loadingInabilityList ? (
                                <div className="flex justify-center py-20">
                                    <StaticLoader />
                                </div>
                            ) : shortageList.length === 0 ? (
                                <div className="py-20 text-xl text-center text-gray-500 bg-gray-50 rounded-2xl">
                                    {t("No shortages found in this inventory")}
                                </div>
                            ) : (
                                <div className="overflow-hidden bg-white shadow-lg rounded-2xl">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="w-12 px-4 py-4 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedShortages.length === shortageList.length}
                                                            onChange={selectAllShortages}
                                                            className="w-5 h-5 rounded"
                                                        />
                                                    </th>
                                                    <th className="px-6 py-4 text-sm font-medium text-left text-gray-700">
                                                        {t("Product")}
                                                    </th>
                                                    <th className="px-6 py-4 text-sm font-medium text-left text-gray-700">
                                                        {t("Category")}
                                                    </th>
                                                    <th className="px-6 py-4 text-sm font-medium text-left text-gray-700">
                                                        {t("Quantity")}
                                                    </th>
                                                    <th className="px-6 py-4 text-sm font-medium text-left text-gray-700">
                                                        {t("Actual Qty")}
                                                    </th>
                                                    <th className="px-6 py-4 text-sm font-medium text-left text-gray-700">
                                                        {t("Shortage")}
                                                    </th>
                                                    <th className="px-6 py-4 text-sm font-medium text-left text-gray-700">
                                                        {t("Cost")}
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {shortageList.map((item, index) => {
                                                    const isSelected = selectedShortages.includes(index);
                                                    return (
                                                        <tr key={item.id || index} className={`hover:bg-gray-50 ${isSelected ? "bg-blue-50" : ""}`}>
                                                            <td className="px-4 py-5 text-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => toggleShortageSelection(index)}
                                                                    className="w-5 h-5 rounded"
                                                                />
                                                            </td>
                                                            <td className="px-6 py-5 font-medium text-gray-900">
                                                                {item.product || "—"}
                                                            </td>
                                                            <td className="px-6 py-5 text-gray-600">
                                                                {item.category || "—"}
                                                            </td>
                                                            <td className="px-6 py-5 text-gray-600">
                                                                {item.quantity || 0}
                                                            </td>
                                                            <td className="px-6 py-5 text-gray-600">
                                                                {item.actual_quantity || 0}
                                                            </td>
                                                            <td className={`px-6 py-5 font-bold text-center ${item.inability > 0
                                                                ? "text-red-600"
                                                                : item.inability < 0
                                                                    ? "text-green-600"
                                                                    : "text-gray-500"
                                                                }`}
                                                            >
                                                                {item.inability ?? 0}
                                                            </td>
                                                            <td className="px-6 py-5 text-gray-600">
                                                                {item.cost || 0} EGP
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                            {/* Footer with totals */}
                                            <tfoot className="bg-gray-50">
                                                <tr>
                                                    <td colSpan="3" className="px-6 py-4 font-medium text-right text-gray-700">
                                                        {t("Totals")}:
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-gray-800">
                                                        {shortageList.reduce((sum, item) => sum + (item.quantity || 0), 0)}
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-gray-800">
                                                        {shortageList.reduce((sum, item) => sum + (item.actual_quantity || 0), 0)}
                                                    </td>
                                                    <td className={`px-6 py-4 font-bold text-center ${shortageList.reduce((sum, item) => sum + (item.inability || 0), 0) > 0
                                                        ? "text-red-600"
                                                        : shortageList.reduce((sum, item) => sum + (item.inability || 0), 0) < 0
                                                            ? "text-green-600"
                                                            : "text-gray-500"
                                                        }`}
                                                    >
                                                        {shortageList.reduce((sum, item) => sum + (item.inability || 0), 0)}
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-gray-800">
                                                        {shortageList.reduce((sum, item) => sum + (item.cost || 0), 0)} EGP
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : showReport ? (
                        /* Report View */
                        <div>
                            {/* Back Button */}
                            <div className="mb-6">
                                <button
                                    onClick={() => {
                                        setShowReport(false);
                                        setReportData(null);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 text-gray-600 transition hover:text-gray-800"
                                >
                                    <FiArrowLeft size={20} />
                                    {t("Back to Edit")}
                                </button>
                            </div>

                            {/* Report Header */}
                            <div className="p-6 mb-6 bg-white shadow-md rounded-2xl">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        {t("Inventory Report")} #{editingInventoryId}
                                    </h2>
                                    <div className="flex items-center gap-4">
                                        <div className="flex gap-3">
                                            <button
                                                onClick={exportReportPDF}
                                                className="p-3 text-white bg-red-600 rounded-full shadow-lg hover:bg-red-700"
                                                title="PDF"
                                            >
                                                <FiFileText size={20} />
                                            </button>
                                            <button
                                                onClick={exportReportCSV}
                                                className="p-3 text-white bg-blue-600 rounded-full shadow-lg hover:bg-blue-700"
                                                title="CSV"
                                            >
                                                <FiDownload size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Report Data */}
                            <div className="mb-6 overflow-hidden bg-white shadow-lg rounded-2xl">
                                <div className="p-6">
                                    {modifyProductsResponse?.data?.report && modifyProductsResponse.data.report.length > 0 ? (
                                        <div>
                                            {/* Summary Stats */}
                                            <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
                                                <div className="p-4 border border-blue-100 rounded-lg bg-blue-50">
                                                    <div className="text-sm font-medium text-blue-600">{t("Total Products")}</div>
                                                    <div className="mt-1 text-2xl font-bold text-blue-800">
                                                        {modifyProductsResponse.data.report.length}
                                                    </div>
                                                </div>
                                                <div className="p-4 border border-green-100 rounded-lg bg-green-50">
                                                    <div className="text-sm font-medium text-green-600">{t("Total Quantity")}</div>
                                                    <div className="mt-1 text-2xl font-bold text-green-800">
                                                        {modifyProductsResponse.data.report.reduce((sum, item) => sum + (item.quantity || 0), 0)}
                                                    </div>
                                                </div>
                                                <div className="p-4 border border-yellow-100 rounded-lg bg-yellow-50">
                                                    <div className="text-sm font-medium text-yellow-600">{t("Total Actual Qty")}</div>
                                                    <div className="mt-1 text-2xl font-bold text-yellow-800">
                                                        {modifyProductsResponse.data.report.reduce((sum, item) => sum + (item.actual_quantity || 0), 0)}
                                                    </div>
                                                </div>
                                                <div className="p-4 border border-red-100 rounded-lg bg-red-50">
                                                    <div className="text-sm font-medium text-red-600">{t("Total Shortage")}</div>
                                                    <div className="mt-1 text-2xl font-bold text-red-800">
                                                        {modifyProductsResponse.data.report.reduce((sum, item) => sum + (item.inability || 0), 0)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Store Name */}
                                            <div className="mb-6">
                                                <div className="mb-2 text-lg font-semibold text-gray-700">{t("Store")}:</div>
                                                <div className="text-2xl font-bold text-mainColor">
                                                    {modifyProductsResponse.data.store_name || "—"}
                                                </div>
                                            </div>

                                            {/* Detailed Products Table */}
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead className="bg-gray-100">
                                                        <tr>
                                                            <th className="px-6 py-4 text-sm font-medium text-left text-gray-700">
                                                                {t("#")}
                                                            </th>
                                                            <th className="px-6 py-4 text-sm font-medium text-left text-gray-700">
                                                                {t("Product")}
                                                            </th>
                                                            <th className="px-6 py-4 text-sm font-medium text-left text-gray-700">
                                                                {t("Category")}
                                                            </th>
                                                            <th className="px-6 py-4 text-sm font-medium text-left text-gray-700">
                                                                {t("Quantity")}
                                                            </th>
                                                            <th className="px-6 py-4 text-sm font-medium text-left text-gray-700">
                                                                {t("Actual Qty")}
                                                            </th>
                                                            <th className="px-6 py-4 text-sm font-medium text-left text-gray-700">
                                                                {t("Shortage")}
                                                            </th>
                                                            <th className="px-6 py-4 text-sm font-medium text-left text-gray-700">
                                                                {t("Cost")}
                                                            </th>
                                                            <th className="px-6 py-4 text-sm font-medium text-left text-gray-700">
                                                                {t("Date")}
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200">
                                                        {modifyProductsResponse.data.report.map((item, index) => (
                                                            <tr key={item.id || index} className="hover:bg-gray-50">
                                                                <td className="px-6 py-5 font-medium text-gray-900">
                                                                    {index + 1}
                                                                </td>
                                                                <td className="px-6 py-5 font-medium text-gray-900">
                                                                    {item.product || "—"}
                                                                </td>
                                                                <td className="px-6 py-5 text-gray-600">
                                                                    {item.category || "—"}
                                                                </td>
                                                                <td className="px-6 py-5 text-gray-600">
                                                                    {item.quantity || 0}
                                                                </td>
                                                                <td className="px-6 py-5 text-gray-600">
                                                                    {item.actual_quantity || 0}
                                                                </td>
                                                                <td className={`px-6 py-5 font-bold text-center ${item.inability > 0
                                                                    ? "text-red-600"
                                                                    : item.inability < 0
                                                                        ? "text-green-600"
                                                                        : "text-gray-500"
                                                                    }`}
                                                                >
                                                                    {item.inability || 0}
                                                                </td>
                                                                <td className="px-6 py-5 text-gray-600">
                                                                    {item.cost || 0} EGP
                                                                </td>
                                                                <td className="px-6 py-5 text-sm text-gray-600">
                                                                    {item.date ? formatDate(item.date) : "—"}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                    {/* Footer with totals */}
                                                    <tfoot className="bg-gray-50">
                                                        <tr>
                                                            <td colSpan="3" className="px-6 py-4 font-medium text-right text-gray-700">
                                                                {t("Totals")}:
                                                            </td>
                                                            <td className="px-6 py-4 font-bold text-gray-800">
                                                                {modifyProductsResponse.data.report.reduce((sum, item) => sum + (item.quantity || 0), 0)}
                                                            </td>
                                                            <td className="px-6 py-4 font-bold text-gray-800">
                                                                {modifyProductsResponse.data.report.reduce((sum, item) => sum + (item.actual_quantity || 0), 0)}
                                                            </td>
                                                            <td className={`px-6 py-4 font-bold text-center ${modifyProductsResponse.data.report.reduce((sum, item) => sum + (item.inability || 0), 0) > 0
                                                                ? "text-red-600"
                                                                : modifyProductsResponse.data.report.reduce((sum, item) => sum + (item.inability || 0), 0) < 0
                                                                    ? "text-green-600"
                                                                    : "text-gray-500"
                                                                }`}
                                                            >
                                                                {modifyProductsResponse.data.report.reduce((sum, item) => sum + (item.inability || 0), 0)}
                                                            </td>
                                                            <td className="px-6 py-4 font-bold text-gray-800">
                                                                {modifyProductsResponse.data.report.reduce((sum, item) => sum + (item.cost || 0), 0)} EGP
                                                            </td>
                                                            <td className="px-6 py-4"></td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-10 text-center text-gray-500">
                                            {t("No report data available")}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-center gap-6 mt-8">
                                <button
                                    onClick={handleEditQuantity}
                                    className="flex items-center gap-3 px-8 py-3 font-semibold text-white transition bg-blue-600 rounded-xl hover:bg-blue-700"
                                >
                                    <FiEdit size={20} />
                                    {t("Edit Quantity")}
                                </button>
                                <button
                                    onClick={handleAdjustment}
                                    className="flex items-center gap-3 px-8 py-3 font-semibold text-white transition bg-mainColor rounded-xl hover:bg-mainColor/90"
                                >
                                    <FiCheckCircle size={20} />
                                    {t("Adjustment")}
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Edit Inventory Products View */
                        <div>
                            {/* Back Button */}
                            <div className="mb-6">
                                <button
                                    onClick={handleBackToCurrent}
                                    className="flex items-center gap-2 px-4 py-2 text-gray-600 transition hover:text-gray-800"
                                >
                                    <FiArrowLeft size={20} />
                                    {t("Back to Current Inventories")}
                                </button>
                            </div>

                            {/* Edit Inventory Header */}
                            <div className="p-6 mb-6 bg-white shadow-md rounded-2xl">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        {t("Edit Inventory")} #{editingInventoryId}
                                    </h2>
                                    <div className="flex items-center gap-4">
                                        {hasQuantityChanges && (
                                            <span className="px-3 py-1 text-sm font-medium text-yellow-600 rounded-lg bg-yellow-50">
                                                {t("Unsaved changes")}
                                            </span>
                                        )}
                                        <button
                                            onClick={handleSubmitEditedQuantities}
                                            disabled={loadingModifyProducts}
                                            className="flex items-center gap-2 px-6 py-2 font-medium text-white transition bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <FiSave size={18} />
                                            {loadingModifyProducts ? t("Saving...") : t("Submit Changes")}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Inventory Products Table */}
                            {loadingOpenInventory ? (
                                <div className="flex justify-center py-20">
                                    <StaticLoader />
                                </div>
                            ) : inventoryProducts.length === 0 ? (
                                <div className="py-20 text-xl text-center text-gray-500 bg-gray-50 rounded-2xl">
                                    {t("No products found in this inventory")}
                                </div>
                            ) : (
                                <div className="overflow-hidden bg-white shadow-lg rounded-2xl">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="px-6 py-4 text-sm font-medium text-left text-gray-700">
                                                        {t("Category")}
                                                    </th>
                                                    <th className="px-6 py-4 text-sm font-medium text-left text-gray-700">
                                                        {t("Product")}
                                                    </th>
                                                    <th className="px-6 py-4 text-sm font-medium text-left text-gray-700">
                                                        {t("Original Quantity")}
                                                    </th>
                                                    <th className="px-6 py-4 text-sm font-medium text-left text-gray-700">
                                                        {t("Actual Quantity")}
                                                    </th>
                                                    <th className="px-6 py-4 text-sm font-medium text-left text-gray-700">
                                                        {t("Inability")}
                                                    </th>
                                                    <th className="px-6 py-4 text-sm font-medium text-left text-gray-700">
                                                        {t("Cost")}
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {inventoryProducts.map((product, index) => (
                                                    <tr key={index} className="hover:bg-gray-50">
                                                        <td className="px-6 py-5 text-gray-600">
                                                            {product.category || "—"}
                                                        </td>
                                                        <td className="px-6 py-5 font-medium text-gray-900">
                                                            {product.product || "—"}
                                                        </td>
                                                        <td className="px-6 py-5 text-gray-600">
                                                            {product.originalQuantity || 0}
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <input
                                                                type="number"
                                                                value={editedQuantities[index] || product.quantity || 0}
                                                                onChange={(e) => handleInventoryQuantityChange(index, e.target.value)}
                                                                className="w-32 px-3 py-2 font-medium text-center transition border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                            />
                                                        </td>
                                                        <td className={`px-6 py-5 font-bold text-center ${product.inability >= 0
                                                            ? "text-green-600"
                                                            : product.inability < 0
                                                                ? "text-red-600"
                                                                : "text-gray-500"
                                                            }`}
                                                        >
                                                            {product.inability ?? "—"}
                                                        </td>
                                                        <td className="px-6 py-5 text-gray-600">
                                                            {product.cost || 0} EGP
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                ) : (
                    /* Current Inventories Table View */
                    <div className="overflow-hidden bg-white shadow-lg rounded-2xl">
                        {loadingCurrent ? (
                            <div className="flex justify-center py-20">
                                <StaticLoader />
                            </div>
                        ) : currentInventories.length === 0 ? (
                            <div className="py-20 text-xl text-center text-gray-500 bg-gray-50 rounded-2xl">
                                {t("No current inventories found")}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-100">
                                        <tr>
                                          <th className={`px-6 py-4 text-sm font-medium ${direction ? "text-right" : "text-left"} text-gray-700`}>
  {t("#")}
</th>
<th className={`px-6 py-4 text-sm font-medium ${direction ? "text-right" : "text-left"} text-gray-700`}>
  {t("Store")}
</th>
<th className={`px-6 py-4 text-sm font-medium ${direction ? "text-right" : "text-left"} text-gray-700`}>
  {t("Date")}
</th>
<th className={`px-6 py-4 text-sm font-medium ${direction ? "text-right" : "text-left"} text-gray-700`}>
  {t("Products")}
</th>
<th className={`px-6 py-4 text-sm font-medium ${direction ? "text-right" : "text-left"} text-gray-700`}>
  {t("Total Quantity")}
</th>
<th className={`px-6 py-4 text-sm font-medium ${direction ? "text-right" : "text-left"} text-gray-700`}>
  {t("Shortage")}
</th>
<th className={`px-6 py-4 text-sm font-medium ${direction ? "text-right" : "text-left"} text-gray-700`}>
  {t("Action")}
</th>
<th className={`px-6 py-4 text-sm font-medium ${direction ? "text-right" : "text-left"} text-gray-700`}>
  {t("Change Status")}
</th>

                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {currentInventories.map((inventory, index) => (
                                            <tr key={inventory.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-5 font-medium text-gray-900">
                                                    {index + 1}
                                                </td>
                                                <td className="px-6 py-5 text-gray-600">
                                                    {inventory.store || "—"}
                                                </td>
                                                <td className="px-6 py-5 text-gray-600">
                                                    {formatDate(inventory.date)}
                                                </td>
                                                <td className="px-6 py-5 text-gray-600">
                                                    {inventory.product_num || 0}
                                                </td>
                                                <td className="px-6 py-5 text-gray-600">
                                                    {inventory.total_quantity || 0}
                                                </td>
                                                {/* <td className="px-6 py-5 text-gray-600">
                                                    {inventory.cost || 0}
                                                </td> */}
                                                <td className="px-6 py-5">
                                                    {inventory.has_shortage ? (
                                                        <div className="flex items-center gap-2 text-red-600">
                                                            <FiAlertCircle size={20} />
                                                            <span className="font-medium">{t("Has Shortage")}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-green-600">
                                                            <FiCheck size={20} />
                                                            <span className="font-medium">{t("No Shortage")}</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5">
                                                    {finalizingInventory === inventory.id ? (
                                                        // Show Edit Qty and Adjustment buttons when Finalize is clicked (for inventory with shortage)
                                                        // OR just Edit Qty and Remove for inventory without shortage
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleOpenInventory(inventory.id)}
                                                                className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                                                            >
                                                                <FiEdit size={14} />
                                                                {t("Edit Qty")}
                                                            </button>

                                                            {/* Show Adjustment button only if inventory has shortage */}
                                                            {inventory.has_shortage ? (
                                                                <button
                                                                    onClick={() => handleDirectAdjustment(inventory.id)}
                                                                    className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-white transition rounded-lg bg-mainColor hover:bg-mainColor/90"
                                                                >
                                                                    <FiCheckCircle size={14} />
                                                                    {t("Adjustment")}
                                                                </button>
                                                            ) : null}

                                                        </div>
                                                    ) : (
                                                        // Show Finalize button for all inventories
                                                        <button
                                                            onClick={() => handleFinalizeInventory(inventory.id)}
                                                            className="flex items-center gap-2 px-4 py-2 font-medium text-white transition rounded-lg bg-mainColor hover:bg-mainColor/90"
                                                        >
                                                            <FiCheckCircle size={18} />
                                                            {t("Finalize")}
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5">
                                                    <button
                                                        onClick={() => handleChangeStatus(inventory.id, inventory.name)}
                                                        className="flex items-center gap-2 px-2 py-2 text-sm font-medium text-white transition bg-green-600 rounded-lg hover:bg-green-700"
                                                    >
                                                        <FiCheckCircle size={18} />
                                                        {t("Done")}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )
            ) : (
                /* History Inventories Tab */
                <div className="overflow-hidden bg-white shadow-lg rounded-2xl">
                    {loadingHistory ? (
                        <div className="flex justify-center py-20">
                            <StaticLoader />
                        </div>
                    ) : historyInventories.length === 0 ? (
                        <div className="py-20 text-xl text-center text-gray-500 bg-gray-50 rounded-2xl">
                            {t("No history inventories found")}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-sm font-medium text-left text-gray-700">
                                            {t("ID")}
                                        </th>
                                        <th className="px-6 py-4 text-sm font-medium text-left text-gray-700">
                                            {t("Store")}
                                        </th>
                                        <th className="px-6 py-4 text-sm font-medium text-left text-gray-700">
                                            {t("Products")}
                                        </th>
                                        <th className="px-6 py-4 text-sm font-medium text-left text-gray-700">
                                            {t("Total Quantity")}
                                        </th>
                                        <th className="px-6 py-4 text-sm font-medium text-left text-gray-700">
                                            {t("Cost")}
                                        </th>
                                        <th className="px-6 py-4 text-sm font-medium text-left text-gray-700">
                                            {t("Date")}
                                        </th>
                                        <th className="px-6 py-4 text-sm font-medium text-left text-gray-700">
                                            {t("Status")}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {historyInventories.map((inventory) => (
                                        <tr key={inventory.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-5 font-medium text-gray-900">
                                                #{inventory.id}
                                            </td>
                                            <td className="px-6 py-5 text-gray-600">
                                                {inventory.store || "—"}
                                            </td>
                                            <td className="px-6 py-5 text-gray-600">
                                                {inventory.product_num || 0}
                                            </td>
                                            <td className="px-6 py-5 text-gray-600">
                                                {inventory.total_quantity || 0}
                                            </td>
                                            <td className="px-6 py-5 text-gray-600">
                                                ${inventory.cost || 0}
                                            </td>
                                            <td className="px-6 py-5 text-gray-600">
                                                {formatDate(inventory.date)}
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${inventory.status === 'final'
                                                    ? 'bg-green-100 text-green-800'
                                                    : inventory.status === 'current'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {inventory.status === 'final' ? t('Final') :
                                                        inventory.status === 'current' ? t('Current') :
                                                            t(inventory.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default InventoryProduct;