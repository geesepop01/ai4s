---
name: hdf5-pde-data-loading
description: Load and manage large HDF5, NetCDF, and PDE simulation datasets efficiently. Use for array-heavy scientific data, simulation outputs, and datasets larger than memory.
category: data-engineering
tags: [hdf5, netcdf, xarray, large-data, chunking]
disable-model-invocation: true
---

# HDF5 / NetCDF / PDE Data Loading

Scientific array data is large, chunked, and carries metadata. Loading it
carelessly is the difference between an analysis that runs and one that swaps.

## The formats

| Format | Structure | Typical use |
|---|---|---|
| HDF5 (.h5/.hdf5) | Groups + datasets + attributes | General scientific, ML datasets |
| NetCDF4 (.nc) | Dimensions + variables + coordinates | Climate, PDE fields, time series |
| Zarr | Chunked, cloud-native arrays | Very large, parallel, remote |
| NumPy .npy/.npz | Flat arrays | Simple, no structure |
| Parquet | Columnar tables | Tabular, large |

## HDF5

```python
import h5py
import numpy as np

with h5py.File("data.h5", "r") as f:
    print(list(f.keys()))                  # inspect structure first
    print(f["/fields/pressure"].shape, f["/fields/pressure"].dtype)
    print(dict(f["/fields/pressure"].attrs))   # metadata

    dset = f["/fields/pressure"]
    chunk = dset[0:100]                    # read a slice, not the whole thing
```

**Never `f["x"][:]` on a dataset you have not sized.** Read `.shape` and
`.dtype` first; read slices.

## NetCDF / xarray

```python
import xarray as xr

ds = xr.open_dataset("simulation.nc", chunks={"time": 10, "x": 256, "y": 256})
print(ds)                                  # dims, coords, attrs, variables
da = ds["temperature"].isel(time=0)
ds.to_netcdf("derived.nc")
```

xarray carries coordinates and units; use `.sel()` (by label) and `.isel()` (by
position) explicitly — mixing them up is the classic bug.

## Chunking and memory

- **Chunk along the access pattern.** If you analyze over time, chunk with time
  contiguous. Wrong chunking makes every operation read the whole file.
- **Chunk size:** aim for 1–100 MB per chunk. Too small → overhead; too large →
  memory spikes.
- **Dask** for out-of-core: `xr.open_dataset(..., chunks=...)` then `.compute()`
  at the end, not at every step.
- **Memory-mapping** (`np.memmap`) for large flat arrays read sequentially.

## Metadata discipline

Units, coordinate conventions, and the simulation parameters live in attributes.
They are the difference between a number and a measurement:

- **Units in the variable name or the attribute**, never assumed.
- **Coordinate reference / grid** recorded (lat/lon vs projected, cell-centered
  vs node-centered).
- **Simulation parameters** (dt, grid size, scheme) stored with the output.

## Streaming large data

```python
# Process in chunks, never load the whole array
with h5py.File("big.h5", "r") as f:
    dset = f["data"]
    for start in range(0, dset.shape[0], 1024):
        block = dset[start:start+1024]
        process(block)                     # accumulate results, not blocks
```

## Verification

- Check `.shape`, `.dtype`, and attributes before any computation.
- Verify a small known slice manually (the first frame, a known value).
- Confirm the coordinate ordering matches the operation; an x/y transposition is
  invisible in the shape.
- For derived outputs, record the source file and the operation that produced it.

## Common errors

- Loading a whole dataset when a slice suffices.
- Assuming units or coordinate order.
- `isel` vs `sel` confusion.
- Wrong chunking turning a fast pipeline into an I/O bottleneck.
- Dropping attributes when saving a derived file, losing the units.
