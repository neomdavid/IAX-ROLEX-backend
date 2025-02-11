const { NotFoundError, BadRequestError } = require("../errors");
const Watch = require("../models/Watch");
const { StatusCodes } = require("http-status-codes");
const postWatch = async (req, res) => {
  try {
    const watchImage = req.file ? `/uploads/${req.file.filename}` : null;

    if (!watchImage) {
      throw new BadRequestError("Please upload a watch image");
    }

    const watch = await Watch.create({
      ...req.body,
      watchImage,
    });

    res.status(StatusCodes.CREATED).json({ watch, posted: true });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

const getWatch = async (req, res) => {
  const { id } = req.params;
  const watch = await Watch.findById(id);

  if (!watch) {
    throw new NotFoundError(`No watch id : ${id}`);
  }

  const fullImageUrl = `${req.protocol}://${req.get("host")}${
    watch.watchImage
  }`;

  res.status(StatusCodes.OK).json({
    ...watch._doc,
    watchImage: fullImageUrl,
  });
};

const getAllWatches = async (req, res) => {
  const { category } = req.query;

  const queryObject = {};
  if (category && category !== "all") queryObject.category = category;

  const watches = await Watch.find(queryObject);
  res.status(StatusCodes.OK).json({ watches, count: watches.length });
};

const deleteWatch = async (req, res) => {
  const { id } = req.params;
  const watch = await Watch.findByIdAndDelete(id);

  if (!watch) {
    throw new NotFoundError(`No watch id : ${id}`);
  }
  res.status(StatusCodes.OK).send({ watch, deleted: true });
};

const updateWatch = async (req, res) => {
  const { id } = req.params;

  const watchImage = req.file ? `uploads/${req.file.filename}` : undefined;
  const updateData = watchImage ? { ...req.body, watchImage } : req.body;

  const watch = await Watch.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!watch) {
    throw new NotFoundError(`No watch with id: ${id}`);
  }

  res.status(StatusCodes.OK).send({ watch, updated: true });
};

module.exports = {
  getWatch,
  getAllWatches,
  deleteWatch,
  postWatch,
  updateWatch,
};
