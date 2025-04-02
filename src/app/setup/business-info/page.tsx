"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SessionHandler } from "@/lib/sessions-lib"
import { BusinessInfoHandler, BusinessInfo, Product } from "@/lib/businessinfo-lib"

let sessionHandler = new SessionHandler()
let businessInfo = new BusinessInfoHandler()

export default function SetupBusinessInfoPage() {
  const router = useRouter()

  // Global state
  const [sessionUser, setSessionUser] = useState<any>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [loading, setLoading] = useState(true)

  // BusinessInfo state
  const [businessInfos, setBusinessInfos] = useState<BusinessInfo[]>([])
  const [newContent, setNewContent] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState("")

  // Product state
  const [products, setProducts] = useState<Product[]>([])
  const [newProductName, setNewProductName] = useState("")
  const [newProductDescription, setNewProductDescription] = useState("")
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [editingProductName, setEditingProductName] = useState("")
  const [editingProductDescription, setEditingProductDescription] = useState("")

  // Helper: Wrap an async function to handle loading and errors
  const runWithLoading = async (fn: () => Promise<void>) => {
    setLoading(true)
    try {
      await fn()
    } catch (err: any) {
      console.error(err)
      setErrorMessage(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Helper: Truncate long text
  const truncateText = (text: string, maxLength: number) =>
    text.length <= maxLength ? text : text.slice(0, maxLength) + "..."

  // On mount: check session and fetch data
  useEffect(() => {
    runWithLoading(async () => {
        sessionHandler.initSession(
            async (session: any) => {
                setSessionUser(session.user)
                await Promise.all([fetchBusinessInfos(session.user.id), fetchProducts(session.user.id)])
            },
            () => {
                router.push("/auth")
            }
        )
    })
  }, [router])

  // Fetch BusinessInfo rows
  const fetchBusinessInfos = async (userId: string) => {
    businessInfo.fetchBusinessInfo(
        userId,
        (data: any) => {
            setBusinessInfos(data)
        },
        () => {}
    )
  }

  // Fetch Product rows
  const fetchProducts = async (userId: string) => {
    businessInfo.fetchProducts(
        userId,
        (data: any) => {
            setProducts(data)
        },
        () => {}
    );
  }

  // BusinessInfo CRUD operations
  const handleCreate = async () => {
    if (!newContent.trim()) {
      setErrorMessage("Content cannot be empty.")
      return
    }
    await runWithLoading(async () => {
      businessInfo.createBusinessInfo(
        sessionUser.id,
        newContent.trim(),
        (data: any) => {
            setBusinessInfos((prev: any) => [data, ...prev])
            setNewContent("")
        },
        () => {}
      )
    })
  }

  const handleEdit = (info: BusinessInfo) => {
    setEditingId(info.id)
    setEditingContent(info.content)
  }

  const handleUpdate = async () => {
    if (!editingId || !editingContent.trim()) {
      setErrorMessage("Content cannot be empty.")
      return
    }
    await runWithLoading(async () => {
      businessInfo.updateBusinessInfo(
        editingId,
        editingContent.trim(),
        (data: any) => {
            setBusinessInfos((prev: any) =>
              prev.map((item: any) => (item.id === editingId ? (data as BusinessInfo) : item))
            )
            setEditingId(null)
            setEditingContent("")
        },
        () => {}
      )
    })
  }

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this entry?")
    if (!confirmDelete) return
    await runWithLoading(async () => {
      businessInfo.deleteBusinessInfo(
        id,
        (id: any) => {
            setBusinessInfos((prev: any) => prev.filter((item: any) => item.id !== id))
        },
        () => {}
      )
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingContent("")
  }

  // Product CRUD operations
  const handleCreateProduct = async () => {
    if (!newProductName.trim()) {
      setErrorMessage("Product name cannot be empty.")
      return
    }
    await runWithLoading(async () => {
      businessInfo.createProduct(
        sessionUser.id,
        newProductName.trim(),
        newProductDescription.trim(),
        (data: any) => {
            setProducts((prev: any) => [data as Product, ...prev])
            setNewProductName("")
            setNewProductDescription("")
        },
        () => {}
      )
    })
  }

  const handleEditProduct = (prod: Product) => {
    setEditingProductId(prod.id)
    setEditingProductName(prod.name)
    setEditingProductDescription(prod.description || "")
  }

  const handleUpdateProduct = async () => {
    if (!editingProductId || !editingProductName.trim()) {
      setErrorMessage("Product name cannot be empty.")
      return
    }
    await runWithLoading(async () => {
      businessInfo.updateProduct(
        editingProductId,
        editingProductName.trim(),
        editingProductDescription.trim(),
        (data: any) => {
            setProducts((prev: any) =>
              prev.map((p: any) => (p.id === editingProductId ? (data as Product) : p))
            )
            setEditingProductId(null)
            setEditingProductName("")
            setEditingProductDescription("")
        },
        () => {}
      )
    })
  }

  const handleDeleteProduct = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this product?")
    if (!confirmDelete) return
    await runWithLoading(async () => {
      businessInfo.deleteProduct(
        id,
        (id: string) => {
            setProducts((prev: any) => prev.filter((p) => p.id !== id))
        },
        () => {}
      )
    })
  }

  const handleCancelProductEdit = () => {
    setEditingProductId(null)
    setEditingProductName("")
    setEditingProductDescription("")
  }

  if (loading) {
    return (
      <div className="bg-white p-4 rounded shadow max-w-md mx-auto">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      {errorMessage && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{errorMessage}</div>
      )}
      {/* Grid: Left column for Business Info, Right column for Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column: Business Information */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Business Information</h2>
          {!editingId ? (
            <div className="mb-6">
              <label htmlFor="newContent" className="font-semibold block mb-1">
                Add New Business Info
              </label>
              <textarea
                id="newContent"
                rows={4}
                className="w-full border px-3 py-2 rounded text-sm mb-2"
                placeholder="Enter new business info text..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
              />
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Create
              </button>
            </div>
          ) : (
            <div className="mb-6">
              <label htmlFor="editingContent" className="font-semibold block mb-1">
                Edit Business Info
              </label>
              <textarea
                id="editingContent"
                rows={4}
                className="w-full border px-3 py-2 rounded text-sm mb-2"
                placeholder="Update business info text..."
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Update
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          <hr className="my-4" />
          {businessInfos.length === 0 ? (
            <p className="text-sm text-gray-700">No Business Info entries found.</p>
          ) : (
            <ul className="space-y-4">
              {businessInfos.map((info) => (
                <li key={info.id} className="border border-gray-200 p-3 rounded shadow-sm">
                  <p className="text-sm mb-2 whitespace-pre-line">
                    {truncateText(info.content, 100)}
                  </p>
                  <div className="text-xs text-gray-400 mb-2">
                    Created: {new Date(info.createdAt).toLocaleString()}
                    <br />
                    Updated: {new Date(info.updatedAt).toLocaleString()}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(info)}
                      className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(info.id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Right Column: Product Management */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Product Management</h2>
          {!editingProductId ? (
            <div className="mb-6">
              <label htmlFor="newProductName" className="font-semibold block mb-1">
                Add New Product
              </label>
              <input
                id="newProductName"
                type="text"
                className="w-full border px-3 py-2 rounded text-sm mb-2"
                placeholder="Enter product name..."
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
              />
              <textarea
                id="newProductDescription"
                rows={2}
                className="w-full border px-3 py-2 rounded text-sm mb-2"
                placeholder="Enter product description (optional)..."
                value={newProductDescription}
                onChange={(e) => setNewProductDescription(e.target.value)}
              />
              <button
                onClick={handleCreateProduct}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Create Product
              </button>
            </div>
          ) : (
            <div className="mb-6">
              <label htmlFor="editingProductName" className="font-semibold block mb-1">
                Edit Product
              </label>
              <input
                id="editingProductName"
                type="text"
                className="w-full border px-3 py-2 rounded text-sm mb-2"
                placeholder="Update product name..."
                value={editingProductName}
                onChange={(e) => setEditingProductName(e.target.value)}
              />
              <textarea
                id="editingProductDescription"
                rows={2}
                className="w-full border px-3 py-2 rounded text-sm mb-2"
                placeholder="Update product description (optional)..."
                value={editingProductDescription}
                onChange={(e) => setEditingProductDescription(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleUpdateProduct}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Update Product
                </button>
                <button
                  onClick={handleCancelProductEdit}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          <hr className="my-4" />
          {products.length === 0 ? (
            <p className="text-sm text-gray-700">No products found.</p>
          ) : (
            <ul className="space-y-4">
              {products.map((prod) => (
                <li key={prod.id} className="border border-gray-200 p-3 rounded shadow-sm">
                  <p className="text-sm mb-2 font-semibold">{prod.name}</p>
                  {prod.description && (
                    <p className="text-sm mb-2">{prod.description}</p>
                  )}
                  <div className="text-xs text-gray-400 mb-2">
                    Created: {new Date(prod.createdAt).toLocaleString()}
                    <br />
                    Updated: {new Date(prod.updatedAt).toLocaleString()}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEditProduct(prod)}
                      className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(prod.id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
